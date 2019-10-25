/**
 * Call backend graphql api
 *
 * @param query GraphQL query string
 * @param variables an object containing the input variables
 * @returns the response data object
 */
export default async function graphQlCall(query: string, variables: object): Promise<any> {
  try {
    const r = await fetch(`https://${CONFIG.firebase.authDomain}/graphql/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    const res = await r.json();
    if (res.errors) {
      throw new Error(JSON.stringify(res.errors[0]));
    }
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
