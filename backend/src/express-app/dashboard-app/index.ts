interface Context {
  url?: string;
}

const dashboard = (req, res, next) => {
  const context: Context = {};

  if (context.url) {
    // Somewhere a `<Redirect>` was rendered
    res.writeHead(301, {
      Location: context.url,
    });
    res.end();
  } else {
    // TODO set longer caching period for production use
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');

    res.write(
      `<html>
         <body>Page not found</body>
      </html>`,
    );
    res.status(404).end();
  }
};

export default dashboard;
