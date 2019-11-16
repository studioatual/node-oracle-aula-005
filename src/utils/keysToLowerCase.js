const keysToLowerCase = ({ rows }) => {
  return rows.map(row => {
    const item = {};
    Object.keys(row).forEach((key, idx) => {
      item[key.toLowerCase()] = Object.values(row)[idx];
    });
    return item;
  });
};

export default keysToLowerCase;
