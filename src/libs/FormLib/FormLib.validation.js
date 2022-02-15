// described in `validationHandlers` below

export const ValidationStagesE = {
  BLUR: 'blur',
  SUBMIT: 'submit',
};

const validateEmail = (email) => String(email)
  .toLowerCase()
  .match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  )

export const validationHandlers = {
  required: (value) => !!value,
  email: validateEmail,
  min: (value, minValue) => value >= minValue,
  max: (value, maxValue) => value <= maxValue,
  minLength: (value, minLength) => value.length >= minLength,
  maxLength: (value, maxLength) => value.length <= maxLength,
};
