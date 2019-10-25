export enum TokenType {
  none = '-',
  text = 'T',
  url = 'U',
  tag = '#',
}

export interface BaseToken {
  type: TokenType;
}

export enum TextStyle {
  none = 0,
  bold = 1,
  italic = 2,
  underline = 4,
}

/**
 * Plain text token
 */
export interface TextToken extends BaseToken {
  type: TokenType.text;
  content: string;
  style: TextStyle;
}

export interface UrlToken extends BaseToken {
  type: TokenType.url;
  url: string;
}

export interface TagToken extends BaseToken {
  type: TokenType.tag;
  tag: string;
}

export interface Message {
  tokens: Token[];
}

export type Token = TagToken | TextToken | UrlToken;

class ParsingContext {
  public lastType: TokenType;
  public lastStyle: TextStyle;
  public currentStyle: TextStyle;
  public content: string;
  public tokens: Token[];

  constructor() {
    this.lastType = TokenType.text;
    this.lastStyle = TextStyle.none;
    this.currentStyle = TextStyle.none;
    this.content = '';
    this.tokens = [];
  }

  /* tslint:disable no-bitwise */
  public toggleBold = () => {
    this.pushTextToken();
    this.lastStyle = this.currentStyle;
    this.currentStyle =
      (this.currentStyle & TextStyle.bold) === 0
        ? this.currentStyle + TextStyle.bold
        : this.currentStyle - TextStyle.bold;
  }

  public toggleItalic = () => {
    this.pushTextToken();
    this.lastStyle = this.currentStyle;
    this.currentStyle =
      (this.currentStyle & TextStyle.italic) === 0
        ? this.currentStyle + TextStyle.italic
        : this.currentStyle - TextStyle.italic;
  }
  /* tslint:enable no-bitwise */

  public pushTextToken = () => {
    if (this.content.length > 0) {
      this.tokens.push({
        type: TokenType.text,
        style: this.currentStyle,
        content: this.content,
      });
      this.resetTextToken();
    }
  }

  public pushTagToken = (tag: string) => {
    this.tokens.push({
      type: TokenType.tag,
      tag,
    });
    this.resetTextToken();
  }

  public pushUrlToken = (url: string) => {
    this.tokens.push({
      type: TokenType.url,
      url: `https${this.content}${url}`,
    });
    this.resetTextToken();
  }

  public appendContent(text: string) {
    this.content += text;
  }

  private resetTextToken = () => {
    this.lastType = TokenType.text;
    this.content = '';
  }
}
/**
 * Parse raw user message to internal form, where different chat message elements are separated.
 *
 * @param rawMessage User input message
 */
// tslint:disable-next-line
export function parseMessage(rawMessage: string): Token[] {
  const rawTokens = rawMessage.split(/( |\n|\t|:|;|@|#|\_|\*\*)/);
  const context: ParsingContext = new ParsingContext();

  for (const token of rawTokens) {
    const tokenType: TokenType = resolveTokenType(token);

    if (tokenType === TokenType.text) {
      switch (token) {
        case '**':
          context.toggleBold();
          continue;
        case '_':
          context.toggleItalic();
          continue;
        default:
      }
    }

    if (tokenType === TokenType.text) {
      // Merge text tokens
      if (context.lastType === TokenType.text) {
        context.content += token;
      } else {
        switch (context.lastType) {
          case TokenType.tag:
            context.pushTagToken(token);
            continue;

          case TokenType.url:
            if (token === ':') {
              context.content += token;
              continue;
            }
            context.pushUrlToken(token);
            continue;

          default:
        }

        context.lastType = TokenType.text;
        context.content = token;
      }
      continue;
    }

    context.pushTextToken();
    context.content = '';
    context.lastType = tokenType;
  }

  // Append possible tail still remaining in text
  context.pushTextToken();
  return context.tokens;
}

function resolveTokenType(token: string): TokenType {
  if (token === undefined) {
    return TokenType.none;
  }

  if (token.startsWith('#')) {
    return TokenType.tag;
  }

  if (token.toLowerCase().match(/^https|http/)) {
    return TokenType.url;
  }
  return TokenType.text;
}
