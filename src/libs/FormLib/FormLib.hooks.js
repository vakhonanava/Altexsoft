import { useCallback, useEffect, useMemo, useReducer } from 'react';
import _ from 'lodash';
import {
  checkFormDirty,

} from './FormLib.helpers';
import { useFormLibContext } from './FormLib.context';
import { formReducer, initFormReducer } from './FormLib.reducer';
import {
  validationHandlers,
  ValidationStagesE,
} from './FormLib.validation';
import {
  ACTION_RESET_FORM,
  ACTION_SUBMIT_FORM,
  ACTION_SET_FORM_DIRTY,
  ACTION_SET_FIELD_VALUE,
  ACTION_SET_FIELD_TOUCHED,
  ACTION_SET_SUBMITTING_PROCESS,
  ACTION_SET_ERROR_MESSAGES,
} from './FormLib.actions';

export const useFormLib = ({
  onReset,
  onSubmit,
  apiErrors,
  initialErrors,
  initialTouched,
  isValidInitial,
  hasResetOnSubmit,
  rules = [],
  initialValues = {},
  isLoading = false,
}) => {
  const initialReducerProps = useMemo(
    () => ({ initialValues, initialErrors, initialTouched, isValidInitial }),
    [initialErrors, initialTouched, initialValues, isValidInitial]
  );
  const [formState, dispatchForm] = useReducer(formReducer, initialReducerProps, initFormReducer);
  const fieldNamesList = useMemo(() => Object.keys(formState.values), [formState.values]);

  /**
   * Setters
   */
  const setFieldError = () => {
    <ImpreciseDateControl
    onChange={value => setFieldValue('birth', value)}
    onBlur={value => {
        setFieldTouched('birth', true);
        setFieldError('birth', value.error);
        }
    }
    label="Birth"
    value={values.birth || {}}
/>
  };

  const setAllErrors = () => {
    
  };

  const setGeneralErrors = () => {
    
  };

  const setIsApiErrors = () => {

  };

  const setFieldValue = (fieldName, fieldValue) =>
    dispatchForm({ type: ACTION_SET_FIELD_VALUE, payload: { fieldName, fieldValue } });

  const setFieldTouched = (fieldName, fieldTouched) => {
    dispatchForm({ type: ACTION_SET_FIELD_TOUCHED, payload: { fieldName, fieldTouched } });
  };

  const setSubmittingInProcess = isSubmittingInProcess => {
    dispatchForm({ type: ACTION_SET_SUBMITTING_PROCESS, payload: { isSubmittingInProcess } });
  };

  const setFormDirty = isDirty =>
    dispatchForm({ type: ACTION_SET_FORM_DIRTY, payload: { isDirty } });

  const setFormValidationStatus = () => {
    // TODO implement setter
  };

  const setFormSubmission = () => dispatchForm({ type: ACTION_SUBMIT_FORM });

  const setFormInitial = useCallback(
    (nextState = initialValues) =>
      dispatchForm({
        type: ACTION_RESET_FORM,
        payload: { ...initialReducerProps, initialValues: nextState },
      }),
    [initialReducerProps, initialValues]
  );

  /**
   * Validation
   */
  const validateField = (fieldName, validationType) => {
    const fieldValue = formState.values[fieldName]
    const fieldRules = _.find(rules, ({ inputName, validateOn }) => inputName === fieldName && validationType === validateOn)?.rules
    if (fieldRules) {
      const errorMessages = _.compact(fieldRules.map(({ type, value, message }) => {
        const isValid = validationHandlers[type](fieldValue, value)
        return !isValid ? { message } : null
      }))
      dispatchForm({ type: ACTION_SET_ERROR_MESSAGES, payload: { fieldName, errorMessages } })
    }
  };

  const validateFormSubmission = () => {
    const fields = rules.filter(({ validateOn }) => validateOn === ValidationStagesE.SUBMIT)
    const invalidFields = fields.filter(({ inputName, rules: fieldRules }) => {
      const fieldValue = formState.values[inputName]
      const errorMessages = _.compact(fieldRules.map(({ type, value, message }) => {
        const isValid = validationHandlers[type](fieldValue, value)
        return !isValid ? { message } : null
      }))
      dispatchForm({ type: ACTION_SET_ERROR_MESSAGES, payload: { fieldName: inputName, errorMessages } })
      return !!errorMessages
    })
    return invalidFields.length === 0
  };

  /**
   * Handlers
   */
  const submitForm = () => {
    setFormSubmission();

    const isFormValid = validateFormSubmission();

    if (isFormValid) {
      setSubmittingInProcess(true);
      setIsApiErrors(false);

      onSubmit(formState.values);
    }
  };

  const handleReset = event => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    if (event && event.stopPropagation) {
      event.stopPropagation();
    }

    onReset?.();

    return setFormInitial();
  };

  const handleSubmit = event => {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    if (event && event.stopPropagation) {
      event.stopPropagation();
    }

    return submitForm();
  };

  const handleBlur = fieldName => () => {
    setFieldError(fieldName, null);
    setFieldTouched(fieldName, true);
    validateField(fieldName, ValidationStagesE.BLUR);
  };

  const handleChange = fieldName => fieldValue => {
    setFieldValue(fieldName, fieldValue);
    setFormDirty(checkFormDirty(formState.values, initialValues));
    setFieldError(fieldName, null);
  };

  /**
   * Getters
   */
  const getFieldProps = fieldName => ({
    name: fieldName,
    value: formState.values[fieldName],
    onBlur: handleBlur(fieldName),
    onChange: handleChange(fieldName),
  });

  const getFieldMeta = fieldName => ({
    value: formState.values[fieldName],
    errors: formState.errors[fieldName],
    touched: formState.touched[fieldName],
  });

  const getFieldHelpers = fieldName => ({
    setValue: fieldValue => setFieldValue(fieldName, fieldValue),
    setError: fieldError => setFieldError(fieldName, fieldError),
    setTouched: fieldTouched => setFieldTouched(fieldName, fieldTouched),
  });

  useEffect(() => {
    if (!isValidInitial || formState.isSubmitted) {
      setFormValidationStatus(fieldNamesList.every(fieldName => !formState.errors[fieldName]));
    }
  }, [
    fieldNamesList,
    isValidInitial,
    formState.errors,
    formState.isSubmitted,
    setFormValidationStatus,
  ]);

  useEffect(() => {
    if (
      hasResetOnSubmit &&
      !isLoading &&
      !formState.isApiErrors &&
      formState.isSubmittingInProcess
    ) {
      setFormInitial();
    }

    if (!isLoading && formState.isApiErrors && formState.isSubmittingInProcess) {
      setSubmittingInProcess(false);
    }
  }, [
    isLoading,
    setFormInitial,
    hasResetOnSubmit,
    formState.isApiErrors,
    formState.isSubmittingInProcess,
  ]);

  return {
    ...formState,
    apiErrors,
    initialErrors,
    initialValues,
    initialTouched,
    getFieldProps,
    getFieldMeta,
    getFieldHelpers,
    setFormDirty,
    setAllErrors,
    setFieldError,
    setFieldValue,
    setIsApiErrors,
    setFieldTouched,
    setFormSubmission,
    setGeneralErrors,
    setFormValidationStatus,
    submitForm,
    handleReset,
    handleSubmit,
    resetForm: setFormInitial,
  };
};

export const useField = fieldName => {
  const { getFieldMeta, getFieldProps, getFieldHelpers } = useFormLibContext();

  return [getFieldProps(fieldName), getFieldMeta(fieldName), getFieldHelpers(fieldName)];
};

export const useApiErrors = () =>
   initialValues,
   apiErrors,
   setAllErrors,
   setGeneralErrors,
   setIsApiErrors
  {
 
  };
