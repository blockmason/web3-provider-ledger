/**
 * This function provides a convenient way to assert the presence of required
 * named parameters.
 *
 * @param {...string} parameterNames - The keys to assert are defined in the
 * named parameters.
 *
 * @return {Function} - Returns a function that accepts an object containing
 * named parameters, which throws an Error if any of the parameters marked as
 * required are undefined.
 */
const requireParameters = (...parameterNames) => (givenParameters = {}) => {
  const missingParameters = parameterNames.reduce((missingParameters, name) => {
    if (typeof givenParameters[name] === 'undefined') {
      missingParameters.push(name);
    }
    return missingParameters;
  }, []);

  if (missingParameters.length > 0) {
    throw new Error(`ArgumentError: Missing required parameter(s): ${missingParameters.join(', ')}`);
  }
};

export default requireParameters;
