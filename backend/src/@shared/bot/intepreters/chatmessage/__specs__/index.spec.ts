import { parseMessage, TagToken, TextStyle, TextToken, Token, TokenType, UrlToken } from '..';

describe('Chat message parsing', () => {
  it('Parses plain text as a single token', () => {
    const content = 'This is the first day of the rest of my life.';
    const tokens: Token[] = parseMessage(content);

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe(TokenType.text);
    expect((tokens[0] as TextToken).content).toBe(content);
    expect((tokens[0] as TextToken).style).toBe(TextStyle.none);
  });

  it('Parse link in middle of text', () => {
    const content = 'This is a link: https://www.yle.fi to Finnish broadcasting companys\'s site';
    const tokens: Token[] = parseMessage(content);

    expect(tokens.length).toBe(3);
    expect(tokens[0].type).toBe(TokenType.text);
    expect(tokens[1].type).toBe(TokenType.url);
    expect(tokens[2].type).toBe(TokenType.text);
    expect((tokens[0] as TextToken).content).toBe('This is a link: ');
    expect((tokens[0] as TextToken).style).toBe(TextStyle.none);
    expect((tokens[1] as UrlToken).url).toBe('https://www.yle.fi');
    expect((tokens[2] as TextToken).content).toBe(' to Finnish broadcasting companys\'s site');
    expect((tokens[2] as TextToken).style).toBe(TextStyle.none);
  });

  it('Plain link', () => {
    // tslint:disable-next-line
    const content = 'https://www.mindhive.fi';
    const tokens: Token[] = parseMessage(content);

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe(TokenType.url);
    expect((tokens[0] as UrlToken).url).toBe('https://www.mindhive.fi');
  });

  // tslint:disable-next-line
  it('Plain link with capitals', () => {
    // tslint:disable-next-line
    const content = 'HTTPs://www.mindhive.fi';
    const tokens: Token[] = parseMessage(content);

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe(TokenType.url);
    expect((tokens[0] as UrlToken).url).toBe('https://www.mindhive.fi');
  });

  it('Start with link', () => {
    const content = 'https://www.mindhive.fi - käyttäjälähtöisiä palveluita';
    const tokens: Token[] = parseMessage(content);

    expect(tokens.length).toBe(2);
    expect(tokens[0].type).toBe(TokenType.url);
    expect(tokens[1].type).toBe(TokenType.text);
    expect((tokens[0] as UrlToken).url).toBe('https://www.mindhive.fi');
    expect((tokens[1] as TextToken).content).toBe(' - käyttäjälähtöisiä palveluita');
  });

  it('End with link', () => {
    const content = 'käyttäjälähtöisiä palveluita - https://www.mindhive.fi';
    const tokens: Token[] = parseMessage(content);

    expect(tokens.length).toBe(2);
    expect(tokens[0].type).toBe(TokenType.text);
    expect(tokens[1].type).toBe(TokenType.url);
    expect((tokens[0] as TextToken).content).toBe('käyttäjälähtöisiä palveluita - ');
    expect((tokens[1] as UrlToken).url).toBe('https://www.mindhive.fi');
  });

  it('Has an hash tag', () => {
    const content = 'Hiki tulee #kesä kerran vuodessa';
    const tokens: Token[] = parseMessage(content);

    expect(tokens.length).toBe(3);
    expect(tokens[0].type).toBe(TokenType.text);
    expect(tokens[1].type).toBe(TokenType.tag);
    expect(tokens[2].type).toBe(TokenType.text);
    expect((tokens[0] as TextToken).content).toBe('Hiki tulee ');
    expect((tokens[1] as TagToken).tag).toBe('kesä');
    expect((tokens[2] as TextToken).content).toBe(' kerran vuodessa');
  });

  it('Hash tag at start', () => {
    const content = '#kesä kerran vuodessa';
    const tokens: Token[] = parseMessage(content);

    expect(tokens.length).toBe(2);
    expect(tokens[0].type).toBe(TokenType.tag);
    expect(tokens[1].type).toBe(TokenType.text);
    expect((tokens[0] as TagToken).tag).toBe('kesä');
    expect((tokens[1] as TextToken).content).toBe(' kerran vuodessa');
  });

  it('Hash tag at end', () => {
    const content = 'Tässä tägätään #testi';
    const tokens: Token[] = parseMessage(content);

    expect(tokens.length).toBe(2);
    expect(tokens[0].type).toBe(TokenType.text);
    expect(tokens[1].type).toBe(TokenType.tag);
    expect((tokens[0] as TextToken).content).toBe('Tässä tägätään ');
    expect((tokens[1] as TagToken).tag).toBe('testi');
  });

  it('Multiple tags', () => {
    const content = '#kesä#loma#rock';
    const tokens: Token[] = parseMessage(content);

    expect(tokens.length).toBe(3);
    expect(tokens[0].type).toBe(TokenType.tag);
    expect(tokens[1].type).toBe(TokenType.tag);
    expect(tokens[2].type).toBe(TokenType.tag);
    expect((tokens[0] as TagToken).tag).toBe('kesä');
    expect((tokens[1] as TagToken).tag).toBe('loma');
    expect((tokens[2] as TagToken).tag).toBe('rock');
  });

  it('Hash tags in between', () => {
    const content = '#kesä kaikilla #loma osalla #tasa-arvo';
    const tokens: Token[] = parseMessage(content);

    expect(tokens.length).toBe(5);
    expect(tokens[0].type).toBe(TokenType.tag);
    expect(tokens[1].type).toBe(TokenType.text);
    expect(tokens[2].type).toBe(TokenType.tag);
    expect(tokens[3].type).toBe(TokenType.text);
    expect(tokens[4].type).toBe(TokenType.tag);

    expect((tokens[0] as TagToken).tag).toBe('kesä');
    expect((tokens[1] as TextToken).content).toBe(' kaikilla ');
    expect((tokens[2] as TagToken).tag).toBe('loma');
    expect((tokens[3] as TextToken).content).toBe(' osalla ');
    expect((tokens[4] as TagToken).tag).toBe('tasa-arvo');
  });
});

describe('Chat message style parsing', () => {
  it('Bold in middle of text', () => {
    const content = 'this has a **bold** word';
    const tokens: Token[] = parseMessage(content);

    expect(tokens.length).toBe(3);
    expect(tokens[0].type).toBe(TokenType.text);
    expect(tokens[1].type).toBe(TokenType.text);
    expect(tokens[2].type).toBe(TokenType.text);
    expect((tokens[0] as TextToken).style).toBe(TextStyle.none);
    expect((tokens[1] as TextToken).style).toBe(TextStyle.bold);
    expect((tokens[2] as TextToken).style).toBe(TextStyle.none);
  });

  it('Italic in middle of text', () => {
    const content = 'this has a _italic_ word';
    const tokens: Token[] = parseMessage(content);

    expect(tokens.length).toBe(3);
    expect(tokens[0].type).toBe(TokenType.text);
    expect(tokens[1].type).toBe(TokenType.text);
    expect(tokens[2].type).toBe(TokenType.text);
    expect((tokens[0] as TextToken).style).toBe(TextStyle.none);
    expect((tokens[1] as TextToken).style).toBe(TextStyle.italic);
    expect((tokens[2] as TextToken).style).toBe(TextStyle.none);
  });

  it('Mixed Bold and Italic', () => {
    const content = 'this **has a _ita**lic_ word';
    const tokens: Token[] = parseMessage(content);

    expect(tokens.length).toBe(5);
    expect(tokens[0].type).toBe(TokenType.text);
    expect(tokens[1].type).toBe(TokenType.text);
    expect(tokens[2].type).toBe(TokenType.text);
    expect(tokens[3].type).toBe(TokenType.text);
    expect(tokens[4].type).toBe(TokenType.text);
    expect((tokens[0] as TextToken).style).toBe(TextStyle.none);
    expect((tokens[1] as TextToken).style).toBe(TextStyle.bold);
    expect((tokens[2] as TextToken).style).toBe(TextStyle.bold + TextStyle.italic);
    expect((tokens[3] as TextToken).style).toBe(TextStyle.italic);
    expect((tokens[4] as TextToken).style).toBe(TextStyle.none);
    expect((tokens[0] as TextToken).content).toBe('this ');
    expect((tokens[1] as TextToken).content).toBe('has a ');
    expect((tokens[2] as TextToken).content).toBe('ita');
    expect((tokens[3] as TextToken).content).toBe('lic');
    expect((tokens[4] as TextToken).content).toBe(' word');
  });
});
