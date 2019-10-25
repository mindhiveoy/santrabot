export interface UserVariables {
  [key: string]: string;
}

export interface RivescriptBotUsers {
  [userName: string]: UserVariables;
}

export class SantraSessionManager {
  private _users: RivescriptBotUsers = {};
  private _frozen: RivescriptBotUsers = {};

  constructor() {
    this._users = {};
    this._frozen = {};

    this.set = this.set.bind(this);
    this.get = this.get.bind(this);
    this.getAny = this.getAny.bind(this);
    this.setAll = this.setAll.bind(this);
    this.getAll = this.getAll.bind(this);
    this.reset = this.reset.bind(this);
    this.resetAll = this.resetAll.bind(this);
    this.freeze = this.freeze.bind(this);
    this.thaw = this.thaw.bind(this);
  }

  // init makes sure a user exists in the session store.
  public init = (username: string) => {
    const self = this;
    if (self._users[username] === undefined) {
      self._users[username] = self.defaultSession();
    }
  };

  public set(username: string, data: UserVariables): Promise<void> {
    const self = this;

    return new Promise<void>((resolve, reject) => {
      try {
        self.init(username);
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            self._users[username][key] = data[key];
          }
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Reassign user state based
   * @param userName
   * @param data
   */
  public setAll(userName: string, data: UserVariables): Promise<void> {
    const self = this;
    return new Promise<void>((resolve, reject) => {
      try {
        if (!data.topic) {
          data.topic = 'random';
        }
        self._users[userName] = data;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  public get(username: string, key: string): Promise<any> {
    const self = this;
    return new Promise<string>((resolve, reject) => {
      if (self._users[username] === undefined) {
        resolve(undefined);
      } else if (self._users[username][key] !== undefined) {
        resolve(self._users[username][key]);
      } else {
        // Reruired internally in this format by rivescript intepreted
        resolve('undefined');
      }
    });
  }

  public getAny(username: string): Promise<any> {
    const self = this;
    return new Promise<UserVariables>((resolve, reject) => {
      if (self._users[username] === undefined) {
        resolve(undefined);
      } else {
        resolve({ ...self._users[username] });
      }
    });
  }

  public getAll(): Promise<any> {
    const self = this;
    return Promise.resolve<any>((resolve: any) => {
      resolve({ ...self._users });
    });
  }

  public reset(username: string): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (this._users[username] !== undefined) {
        delete self._users[username];
      }
      if (this._frozen[username] !== undefined) {
        delete self._frozen[username];
      }
      resolve();
    });
  }

  public resetAll(): Promise<void> {
    const self = this;
    return new Promise<void>((resolve, reject) => {
      self._users = {};
      self._frozen = {};
      resolve();
    });
  }

  public freeze(username: string): Promise<void> {
    const self = this;
    return new Promise<void>((resolve, reject) => {
      if (self._users[username] !== undefined) {
        self._frozen[username] = { ...self._users[username] };
        resolve();
      } else {
        reject(`freeze(${username}): user not found`);
      }
    });
  }

  public thaw(
    username: string,
    action: 'thaw' | 'discard' | 'keep' = 'thaw',
  ): Promise<void> {
    const self = this;
    return new Promise<void>((resolve, reject) => {
      if (self._frozen[username] !== undefined) {
        // OK what are we doing?
        switch (action) {
          case 'thaw':
            self._users[username] = { ...self._frozen[username] };
            delete self._frozen[username];
            break;
          case 'discard':
            delete self._frozen[username];
            break;
          case 'keep':
            self._users[username] = { ...self._frozen[username] };
            break;
          default:
            reject('bad thaw action');
        }
        resolve();
      } else {
        reject(`thaw(${username}): no frozen variables found`);
      }
    });
  }

  /**
   * You do not need to override this method. This returns the default session
   * variables for a new user, e.g. with the variable `topic="random"` as per
   * the RiveScript spec.
   */
  private defaultSession() {
    return {
      topic: 'random',
    };
  }
}

let sessionManager: SantraSessionManager;

export default function getSessionManager(): SantraSessionManager {
  if (!sessionManager) {
    sessionManager = new SantraSessionManager();
  }
  return sessionManager;
}
