const validationFormat = errors => {
  return errors.array().reduce((obj, { msg, param }) => {
    const newObj = obj;
    const item = newObj[param] ? newObj[param] : [];
    item.push(msg);
    newObj[param] = item;
    return newObj;
  }, {});
};

export default validationFormat;
