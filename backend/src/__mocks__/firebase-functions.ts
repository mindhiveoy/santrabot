class HttpsErrorMock extends Error {
  constructor(public errorCode: string, message: string) {
    super(message);
  }
}

const functions: any = {
  https: {
    onCall: (...args: any[]) => {
      // console.log('functions.auth.user.onCreate: ' + JSON.stringify(args));
    },
    HttpsError: HttpsErrorMock,
  },
  auth: {
    user: () => {
      return {
        onCreate: (...args: any[]) => {
          // console.log('functions.auth.user.onCreate: ' + JSON.stringify(args));
        },
      };
    },
  },
  config: () => {
    return {};
  },
};

// tslint:disable-next-line
export = functions;
