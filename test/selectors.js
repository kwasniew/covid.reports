export const selectors = $ => {
  const $class = name => expected => element => {
    const actual = element.find(name).text();
    return { actual, expected };
  };

  const $text = expected => element => {
    const actual = element.text().trim();
    return { actual, expected };
  };

  const splitResults = results => ({
    actual: results.map(({ actual }) => actual),
    expected: results.map(({ expected }) => expected)
  });

  const $row = expected => tr => {
    return splitResults(
      Array.from(
        tr.find("td,th").map((i, e) => {
          return typeof expected[i] === "string"
            ? $text(expected[i])($(e))
            : expected[i]($(e));
        })
      )
    );
  };

  const $table = expected => {
    return splitResults(
      Array.from($("table tr").map((i, tr) => [expected[i]($(tr))]))
    );
  };

  return { $table, $row, $class };
};
