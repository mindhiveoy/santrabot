import { CircularProgress } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { DEFAULT_SCRIPT_FILE, EMPTY_SCRIPT_FILE, getBot, RIVE_START_DOCUMENT } from '@shared/bot/intepreter';
import testCode from '@shared/bot/rive_template';
import { DEFAULT_BOT_NAME, Schema, Script } from '@shared/schema';
import { AppAction, ApplicationState } from 'dashboard/reducers';
import { UserOrganizatioInfoWithId } from 'dashboard/reducers/auth/authReducer';
import { info } from 'dashboard/reducers/bot-log/botLogActions';
import { NaviButtons, naviButtonStageChange, setNaviButtons } from 'dashboard/reducers/navi/naviActions';
import * as firebase from 'firebase';
import firebaseApp from 'firebaseApp';
import * as React from 'react';
import { DispatchProp } from 'react-redux';
import styled from 'styled-components';

import { connect } from 'react-redux';
import { isBrowser } from 'utils/environment';
import { concatenateScriptFiles } from 'utils/riveUtils';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import LogPanel from './LogPanel';
import RenameDialog from './RenameDialog';
import ScriptContainer from './ScriptContainer';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;

  .code-editor {
    flex-grow: 1;
  }
`;

const WorkArea = styled.div`
  flex-grow: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const StyledCircularProgress = styled<any>(CircularProgress)`
  margin: auto;
`;
export interface ScriptEditorProps extends DispatchProp<AppAction> {
  activeOrganization?: UserOrganizatioInfoWithId;
}

interface State {
  modified: {
    [scriptName: string]: boolean;
  };
  /**
   * Code been modified. This is the document where the #activeScriptName is referening to.
   */
  code: string;
  /**
   * Ace editor component, which is loaded dynamically only when running in broser
   */
  editor: any;
  /**
   * Active script document's name
   */
  activeScriptName?: string;
  /**
   * All scripts defining a bot
   */
  scripts: Script[];

  loading: boolean;

  deleteDialogOpen: boolean;

  renameDialogOpen: boolean;
}

class CodeEditor extends React.Component<ScriptEditorProps, State> {
  private Editor: any;

  private scriptsRef: firebase.firestore.CollectionReference;

  private unsubscribeScripts: () => void;

  constructor(props: any) {
    super(props);

    this.state = {
      modified: {},
      code: testCode,
      editor: null,
      activeScriptName: RIVE_START_DOCUMENT,
      scripts: [EMPTY_SCRIPT_FILE],
      loading: true,
      deleteDialogOpen: false,
      renameDialogOpen: false,
    };
  }

  public componentWillUnmount() {
    this.unsubscribeScripts && this.unsubscribeScripts();
  }

  public componentWillReceiveProps(newProps: ScriptEditorProps) {
    this.loadScripts(newProps);
  }

  public componentDidMount() {
    this.loadScripts(this.props);
    /*
     * AceEditor does not support server side rendering, so we will load it dynamically when running
     * at the browser side.
     */
    if (isBrowser()) {
      import(/* webpackChunkName: "ace-editor" */ 'react-ace')
        .then(editor => {
          this.Editor = editor.default;
          this.forceUpdate();
        })
        .catch(error => console.error(error));
    }

    this.props.dispatch(setNaviButtons(this.getNaviButtons()));
    this.props.dispatch(info('Bottieditori käynnistetty'));

    // Register CMD + Save and CTRL + Save -handler
    document.addEventListener('keydown', this.savePressHandler, false);
  }

  public componentWillUnMount() {
    document.removeEventListener('keydown', this.savePressHandler);
  }

  public componentDidUpdate(prevProps: ScriptEditorProps, prevState: State) {
    if (prevState.modified !== this.state.modified || prevState.activeScriptName !== this.state.activeScriptName) {
      this.props.dispatch(setNaviButtons(this.getNaviButtons()));
      this.props.dispatch(naviButtonStageChange());
    }
  }

  public render() {
    const { scripts, activeScriptName, loading, deleteDialogOpen, renameDialogOpen } = this.state;

    return (
      <Container>
        {/* <EditorToolBar /> */}
        <WorkArea>
          {loading ? (
            <StyledCircularProgress size={50} color="secondary" />
          ) : (
            <>
              <ScriptContainer
                scripts={scripts}
                activeScriptName={activeScriptName || ''}
                onScriptClick={this.onScriptClick}
              />
              {this.renderEditor()}
              {/* <HelpContainer>Tänne voidaan laittaa tilannekohtaisia ohjeita esille skriptaajalle.</HelpContainer> */}
            </>
          )}
        </WorkArea>
        <LogPanel />
        <ConfirmDeleteDialog
          fileName={activeScriptName || ''}
          open={deleteDialogOpen}
          onCancel={this.handleDeleteDialogCancel}
          onApprove={this.handleDeleteDialogApprove}
        />
        <RenameDialog
          fileName={activeScriptName || ''}
          open={renameDialogOpen}
          onCancel={this.handleRenameDialogCancel}
          onValidate={this.handleRenameDialogValidate}
          onApprove={this.handleRenameDialogApprove}
        />
      </Container>
    );
  }

  private savePressHandler = e => {
    if ((window.navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey) && e.keyCode == 83) {
      e.preventDefault();
      this.handleSaveClick();
    }
  };

  private loadScripts(props: ScriptEditorProps) {
    this.unsubscribeScripts && this.unsubscribeScripts();

    const { activeOrganization } = this.props;

    if (activeOrganization) {
      this.scriptsRef = firebaseApp
        .firestore()
        .collection(Schema.ORGANIZATIONS)
        .doc(activeOrganization.id)
        .collection(Schema.BOTS)
        .doc(DEFAULT_BOT_NAME)
        .collection(Schema.SCRIPTS);
      this.unsubscribeScripts = this.scriptsRef.onSnapshot(this.onScriptsSnapshot, onError => {
        alert(JSON.stringify(onError));
      });
    }
  }

  private onScriptsSnapshot = (snapshot: firebase.firestore.QuerySnapshot) => {
    // TODO Use set an update only changes
    const scripts: Script[] = [];

    if (!snapshot.empty) {
      snapshot.docs.forEach(doc => {
        scripts.push({ ...doc.data(), name: doc.id } as Script);
      });
    }

    if (scripts.length === 0) {
      scripts.push(DEFAULT_SCRIPT_FILE);
    }

    const scriptName = this.state.activeScriptName || RIVE_START_DOCUMENT;
    const script = scripts.find(s => s.name === scriptName);
    const code = script ? script.data : EMPTY_SCRIPT_FILE.data;

    this.setState({
      scripts,
      modified: {},
      code,
      loading: false,
    });
    this.compile();
  };

  private getNaviButtons = (): NaviButtons => {
    const { modified, activeScriptName } = this.state;

    const disabled = Object.keys(modified).length === 0;

    const isDefaultDocument = activeScriptName === RIVE_START_DOCUMENT;
    return {
      leftButtons: [
        <Button key="save" disabled={disabled} variant="contained" color="primary" onClick={this.handleSaveClick}>
          Tallenna
        </Button>,
        <Button
          key="add-doc"
          style={{ marginLeft: '10px' }}
          variant="contained"
          color="primary"
          onClick={this.handleNewDocument}
        >
          Lisää
        </Button>,
        <Button
          key="remove-doc"
          style={{ marginLeft: '10px' }}
          disabled={isDefaultDocument}
          variant="contained"
          color="primary"
          onClick={this.handleDeleteDocument}
        >
          Poista
        </Button>,
        <Button
          key="rename-doc"
          style={{ marginLeft: '10px' }}
          disabled={isDefaultDocument}
          variant="contained"
          color="primary"
          onClick={this.handleRenameDocument}
        >
          Nimeä
        </Button>,
      ],
    };
  };

  private renderEditor = () => {
    if (!this.Editor) {
      return null;
    }

    const Editor = this.Editor;

    const editorStyle = {
      width: '100%',
      height: '100%',
    };

    return (
      <Editor
        className="code-editor"
        mode="java"
        theme="github"
        onChange={this.updateCode}
        name="CODE_EDITOR"
        editorProps={{
          $blockScrolling: Infinity,
        }}
        style={editorStyle}
        value={this.state.code}
      />
    );
  };

  private onScriptClick = (script: Script) => {
    this.setState({
      activeScriptName: script.name || '[error]',
      code: script.data, // this.getCodeForName(script.name) || '[error]',
    });
  };

  private updateCode = (code: string) => {
    const { activeScriptName, scripts } = this.state;
    let { modified } = this.state;

    const script = scripts.find(item => item.name === activeScriptName);

    if (script) {
      script.modified = Date.now();
      script.data = code;
    }

    modified = { ...modified, [activeScriptName || '[error]']: true };
    this.setState({
      modified,
      code,
    });

    this.props.dispatch(setNaviButtons(this.getNaviButtons));
  };

  /**
   * Save all modified script documents
   */
  private handleSaveClick = () => {
    const { scripts, modified } = this.state;

    // TODO use batch
    for (const scriptName in modified) {
      if (modified.hasOwnProperty(scriptName)) {
        const script = scripts.find(item => item.name === scriptName);
        script && this.scriptsRef && this.scriptsRef.doc(scriptName).set(script);
      }
    }

    this.setState({
      modified: {},
    });

    this.compile();
  };

  /**
   * Create a new script document into memory
   */
  private handleNewDocument = () => {
    const scripts = this.state.scripts ? [...this.state.scripts] : [];

    const activeScriptName = this.uniqueScriptName(scripts, 'tiedosto');
    const newScript = { ...EMPTY_SCRIPT_FILE };
    newScript.name = activeScriptName;
    newScript.modified = Date.now();

    scripts.push(newScript);

    const modified = { ...this.state.modified, [activeScriptName]: true };
    this.setState({
      activeScriptName,
      scripts,
      code: newScript.data,
      modified,
    });
  };

  private handleDeleteDocument = () => {
    this.setState({
      deleteDialogOpen: true,
    });
  };

  private handleDeleteDialogCancel = () => {
    this.setState({
      deleteDialogOpen: false,
    });
  };

  private handleDeleteDialogApprove = () => {
    const activeScriptName = this.state.activeScriptName;

    const scripts = this.state.scripts ? [...this.state.scripts] : [];

    const index = scripts.findIndex(item => item.name === activeScriptName);
    if (index >= 0) {
      scripts.splice(index, 1);
    }

    this.setState({
      deleteDialogOpen: false,
      scripts,
    });

    this.scriptsRef && this.scriptsRef.doc(activeScriptName).delete();
  };

  private handleRenameDocument = () => {
    this.setState({
      renameDialogOpen: true,
    });
  };

  private handleRenameDialogCancel = () => {
    this.setState({
      renameDialogOpen: false,
    });
  };

  private handleRenameDialogValidate = (fileName: string): boolean => {
    return this.state.scripts.findIndex(item => item.name === fileName) < 0;
  };

  private handleRenameDialogApprove = async (fileName: string) => {
    const activeScriptName = this.state.activeScriptName;
    const script = this.state.scripts.find(item => item.name === activeScriptName);

    if (!script) {
      return;
    }

    /* The script document id is also the name of the document, so we will delete the old document and generate a new with new id */
    const oldScriptRef = this.scriptsRef.doc(activeScriptName);
    const newScriptRef = this.scriptsRef.doc(fileName);

    script.name = fileName;

    try {
      await firebaseApp.firestore().runTransaction(transaction => {
        return transaction.get(newScriptRef).then(doc => {
          transaction.set(newScriptRef, script).delete(oldScriptRef);
        });
      });

      this.setState({
        renameDialogOpen: false,
        activeScriptName: fileName,
      });
    } catch (error) {
      this.setState({
        renameDialogOpen: false,
      });
    }
  };

  private uniqueScriptName = (scripts: Script[], name: string): string => {
    let index = 1;
    let fileName = name;
    while (scripts.find(item => item.name === fileName)) {
      fileName = name + index++;
    }
    return fileName;
  };

  private compile = () => {
    const riveBot = getBot(this.props.activeOrganization!.id, DEFAULT_BOT_NAME, true);

    let hasErrors = false;

    const onError = (error: any) => {
      hasErrors = true;
      this.props.dispatch(error(error));
    };
    riveBot.stream(concatenateScriptFiles(this.state.scripts), onError);

    if (!hasErrors) {
      riveBot.sortReplies();
      this.props.dispatch && this.props.dispatch(info('Scriptin kääntö onnistui.'));
    }
  };
}

const mapStateToProps = (state: ApplicationState) => {
  return {
    activeOrganization: state.auth.activeOrganization,
  };
};

export default connect(mapStateToProps)(CodeEditor);
