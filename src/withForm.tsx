import * as React from 'react'
import {
  transform,
  cloneDeep,
  isNil,
  get,
  flatMap,
  values,
  some,
  reduce,
  isPlainObject
} from 'lodash'
const hoistNonReactStatics = require('hoist-non-react-statics')

import { isEmail } from './validate'

export function unwrap<TUnwrapped, P>(item: TUnwrapped | ((props: P, field?: TrackedField, fields?: TrackedFields) => TUnwrapped), props: P, field?: TrackedField, fields?: TrackedFields): TUnwrapped {
  return typeof item === 'function' ? item(props, field, fields) : item
}

const getEmptyFieldState = (field: FieldDefinition, key: string, initialValue = ''): TrackedField => {
  const hasStaticInitialValue = field.initialValue !== undefined && typeof field.initialValue !== 'function'
  var value = hasStaticInitialValue ? field.initialValue : initialValue
  return {
    name: key,
    value: value,
    originalValue: cloneDeep(value),
    touched: false,
    didBlur: false
  }
}

export interface Validator {
  /**
   * Validates a form field.
   *
   * @param field The field being validated.
   * @param allFields All form fields.
   * @param props All incoming `props`
   * @return {ValidationResult}
   */
  (field: TrackedField, allFields: TrackedFields, props: any): ValidationResult
}

export interface AggregatedValidationResult {
  isValid: boolean
  messages: Array<string>
}

export interface ValidationResult {
  /**
   * The result of validating a field
   * @typedef {Object} ValidationResult 
   * @property {boolean} isValid A value indicating if this field is valid or not
   * @property {string} message A validation message if isValid is false
  */
  isValid: boolean
  message?: string
}

export interface FormValidationResult {
  isValid: boolean
  messages: Array<string>
}

export type UnwrappedValidatorSet = Array<Validator>

export interface ComputedValidatorSet {
  /**
   * An alternative way to define validators for this field for convenience. Use this if you want easy
   * access to props in all your validators.
   * @param props All incoming `props`. These are the same props available (3rd argument) in every validator function
   * @return An array of validators
   */
  (props): UnwrappedValidatorSet
}

export type ValidatorSet = UnwrappedValidatorSet | ComputedValidatorSet

export interface ComputedProps {
  /**
   * Maps incoming props to this field.
   *
   * @param props All incoming `props`
   * @return Computed field props which will be available in your component via `this.props.fields.[yourFieldName].props`
   */
  (props: any): any
}

export interface FieldDefinition {

  /**
   * Maps incoming props to this field.
   * 
   * These are the props which will become available in your component via `this.props.fields.[yourFieldName].props`
   * this can either be a plain object or a function that maps incoming `props` to the props you wish be be made
   * available to this field.
   */
  props?: ComputedProps | any

  /**
  * Specifies the validators for this field. Must take the form of either an array of validators or a function that returns an array of validators
  */
  validators?: ValidatorSet

  /**
  * Specifies the initial value for this field that should be set when the form is loaded. 
  * Takes priority the value received for this field in `mapPropsToFields`. Can be a function or a static value
  */
  initialValue?: ((props) => any) | any
}

export interface FormFieldDefinition {
  [key: string]: FieldDefinition
}

export interface ValidatorComposer {
  (...parms): Validator
}

export enum FormStatus {
  CLEAN = 'clean',
  TOUCHED = 'touched',
  SUBMITTING = 'submitting',
  LOADING = 'loading'
}

export interface FieldState extends TrackedField {
  isDirty: boolean
  isValid: boolean
  messages: Array<string>
}

export interface FieldHandlers {
  onBlur: (e: React.FormEvent<Element>) => void
  onChange: (e: React.FormEvent<Element> | React.ChangeEvent<Element>) => void
}

export interface Field {
  state: FieldState
  errors: any
  props: any
  handlers: FieldHandlers
}

export interface FieldProp {
  [key: string]: Field
}

export interface FormStateFromFields {
  isDirty: boolean
  validation: FormValidationState
}

export interface FormValidationState {
  isValid: boolean
  messages: Array<string>
}

export interface FormProp {
  validation: FormValidationState
  onSubmit: (context?) => void
  updateField: (fieldName: string, value: any) => void
  bulkUpdateFields: (partialUpdate: any) => void
  status: FormStatus
  isDirty: boolean
  value: any
  submitCount: number
  hasSubmitted: boolean
  errors: Array<string>
}

export interface ComputedFormState {
  fields: FieldProp
  form: FormProp
}

export interface FormState {
  submitCount: number,
  fields: TrackedFields,
  formStatus: FormStatus
}

export interface FormDefinition {

  /**
   * A function which accepts all incoming props and returns a boolean indicating whether the form has finished loading.
   * mapPropsToFields will not be called untils `formHasFinishedLoadingWhen` function returns true.
   * 
   * Specifies when all the data has finished loading for this form and hence when initial values can be mapped.
   * This will affect form.status - while the form is loading `form.status === 'loading'`.
   * 
   * NB The form will be disabled until this function returns true
  */
  formHasFinishedLoadingWhen?: (any) => boolean,

  /**
   * A function which accepts all incoming props and returns a boolean indicating whether the form is busy submitting.
   * This will affect form.status - When the form is submitting `form.status === 'submitting'`.
   * 
   * NB The form will be disabled until this function returns true
  */
  formIsSubmittingWhen?: (any) => boolean,

  /**
   * The field definitions for this form. Used to specify props and validation for each field.
  */
  fields: FormFieldDefinition,

  /**
  * Maps incoming props to the fields definied by `fieldDefinitions`. 
  * Must return an object whose keys match the keys defined in `fieldDefinitions`. 
  * Unrecognized keys will not be mapped to any field.
  * 
  * This function will only be called once `formHasFinishedLoadingWhen` returns true.
  */
  mapPropsToFields?: (props) => any,

  /**
    * Maps incoming props to errors. This is intended to map server-side validation to the fields on the form. 
    * Must return an object whose keys match the keys defined in fieldDefinitions. Unrecognized keys will not be mapped to any field,
    * however all values will be available in your component in `this.props.form.errors` which is useful for displaying errors that do not relate
    * to any field in particular.
    * 
    * NB These errors are not held within form state and you are responsible for clearing these error messages from whatever store they are kept in.
    */
  mapPropsToErrors?: (props) => FormErrors,

  /**
   * The function that should called when submitting your form.
   * Accepts
   * @param formValue the value associated with this form. 
   * @param props all incoming `props`
   * @param context any data that might be specific to the context of your component that would not be available on `form.value` or `props` which 
   * can be passed to the `onSubmit` function that is available via `this.props.form.onSubmit`
   */
  onSubmit: (formValue, props, context) => void
}

export interface TrackedFields {
  [key: string]: TrackedField
}

export interface FormErrors {
  [key: string]: Array<string>
}

export interface TrackedField {
  name: keyof FormFieldDefinition
  value: any | null
  originalValue: any | null
  touched: boolean
  didBlur: boolean
}

const logDevelopment = (...params) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...params)
  }
}

const defaultFormHasFinishedLoading = () => {
  // logDevelopment('formHasFinishedLoadingWhen has not been supplied to the withForm higher order component but its value is not defined.')
  return true
}
const defaultFormIsSubmitting = () => {
  logDevelopment('formIsSubmittingWhen function has not been supplied. Provide this function if you want your form to know when it is submitting correctly')
  return false
}

const noErrors = []
const noValidators = []
const defaultFormValidation = { isValid: true, messages: [] }
const anEmptyObject = Object.freeze({})

export default function ({
  formHasFinishedLoadingWhen = defaultFormHasFinishedLoading,
  formIsSubmittingWhen = defaultFormIsSubmitting,
  fields: fieldDefinitions = {},
  mapPropsToFields = () => (anEmptyObject),
  mapPropsToErrors = () => (anEmptyObject),
  onSubmit = () => { }
}: FormDefinition) {

  const submitting = formIsSubmittingWhen

  const formHasLoaded = (props) => {
    const res = formHasFinishedLoadingWhen(props)
    if (typeof res !== 'boolean') {
      logDevelopment('formHasFinishedLoadingWhen must return a boolean value but instead returned a ' + typeof res)
      return !!res
    }
    return res
  }

  const mapToErrors = (props): FormErrors => {
    const errors = mapPropsToErrors(props)
    if (!isPlainObject(errors)) {
      logDevelopment('mapPropsToErrors must return an object but instead returned a ' + typeof errors)
      return anEmptyObject
    }
    return errors
  }

  const mapToFields = (props): object => {
    const value = mapPropsToFields(props)
    if (!isPlainObject(value)) {
      if (value !== undefined || value !== null)
        logDevelopment('mapPropsToFields must return an object but instead returned a ' + typeof value)
      return anEmptyObject
    }
    return value
  }

  const getInitialState = (props) => {
    const state: FormState = {
      submitCount: 0,
      fields: {},
      formStatus: FormStatus.LOADING
    }
    state.fields = createTrackedFormFields(props)
    if (!formHasLoaded(props)) return state
    state.formStatus = FormStatus.CLEAN
    return state
  }

  const createTrackedFormFields = (props): TrackedFields => {

    const formIsReady = formHasLoaded(props)
    const fieldValues = formIsReady ? mapToFields(props) : anEmptyObject

    return transform<FieldDefinition, TrackedField>(fieldDefinitions, (ret, field, key) => {
      const initialFieldState = getEmptyFieldState(field, key)
      if (formIsReady) {
        const initialValue = field.initialValue === undefined ?
          fieldValues[key] || '' :
          unwrap(field.initialValue, props) || ''

        initialFieldState.value = initialValue
        initialFieldState.originalValue = cloneDeep(initialValue)
      }
      ret[key] = initialFieldState
    })
  }

  const getErrorsFromProps = (props) => {
    return formHasLoaded(props) ? mapToErrors(props) : anEmptyObject
  }

  const getFormItem = (fields: TrackedFields) => {
    return transform<TrackedField, any>(fields, (ret, field, key) => {
      ret[key] = field.value
    })
  }

  const touchAllFields = (fields: TrackedFields): TrackedFields => (
    transform<TrackedField, TrackedField>(fields, (ret, val, field) => {
      ret[field] = { ...val, touched: true, didBlur: true }
    })
  )

  const untouchAllFields = (fields: TrackedFields): TrackedFields => (
    transform<TrackedField, TrackedField>(fields, (ret, val, field) => {
      ret[field] = { ...val, touched: false, didBlur: false, originalValue: val.value }
    })
  )

  return (Child) => {

    class Enhance extends React.Component<any, FormState> {

      private formLoaded: boolean

      constructor(props) {
        super(props)
        this.state = getInitialState(props)
        this.formLoaded = formHasLoaded(props)
      }

      componentWillReceiveProps(nextProps, nextState) {
        if (!this.formLoaded && formHasLoaded(nextProps)) {
          this.formLoaded = true
          this.setState(getInitialState(nextProps))
        }

        if (!submitting(this.props) && submitting(nextProps)) {
          return this.setState({ formStatus: FormStatus.SUBMITTING })
        }

        if (submitting(this.props) && !submitting(nextProps)) {
          return this.setState(prevState => ({
            formStatus: FormStatus.CLEAN,
            fields: untouchAllFields(this.state.fields)
          }))
        }
      }

      updateField = (fieldName, value) => {
        if (!this.formLoaded) return
        const field = cloneDeep(this.state.fields[fieldName])
        field.value = value
        field.touched = true
        const fields = cloneDeep(this.state.fields)
        fields[fieldName] = field
        this.setState(prevState => ({ fields, formStatus: FormStatus.TOUCHED }))
      }

      bulkUpdateFields = (partialUpdate: Object) => {
        if (!this.formLoaded) return
        const fields = transform<any, TrackedField>(partialUpdate, (ret, value, fieldName) => {
          ret[fieldName].value = value
          ret[fieldName].touched = true
        }, cloneDeep(this.state.fields))

        this.setState(prevState => ({ fields, formStatus: FormStatus.TOUCHED }))
      }

      submit = (context) => {
        if (!this.formLoaded) return
        this.setState((prevState) => {
          const fields = touchAllFields(prevState.fields)
          onSubmit(getFormItem(fields), this.props, context)
          return { fields, submitCount: prevState.submitCount + 1 }
        })
      }

      onFieldChange = (e: React.FormEvent<HTMLInputElement>) => {
        if (!this.formLoaded) return
        if (!get(e, 'target.name')) {
          return logDevelopment(
            `The 'name' prop is not being passed to your input as is required to use the onChange handler on each field.
            If you want to manually update this input use the 'updateField' function which can be accessed in your component via this.props.form.updateField.`
          )
        }

        if (!this.state.fields[e.currentTarget.name]) {
          return logDevelopment(
            `Field '${e.currentTarget.name}' does not exist on your form.
            This could be due to the 'name' prop not being passed to your input.
            If you want to manually update this input use the 'updateField' function which can be accessed in your component via this.props.form.updateField.`
          )
        }

        this.updateField(e.currentTarget.name, e.currentTarget.value)
      }

      onFieldBlur = (e?: React.FormEvent<HTMLInputElement>) => {
        if (!this.formLoaded) return

        if (!get(e, 'currentTarget.name')) {
          return logDevelopment(
            `The 'name' prop is not being passed to your input as is required to use the onChange handler on each field.
            Did blur cannot be updated.`
          )
        }

        if (!this.state.fields[e.currentTarget.name]) {
          return logDevelopment(
            `Field '${e.currentTarget.name}' does not exist on your form.
            This could be due to the 'name' prop not being passed to your input. Did blur cannot be updated.`
          )
        }

        if (this.state.fields[e.currentTarget.name].didBlur) {
          return
        }

        this.setState({
          fields: {
            ...this.state.fields,
            [e.currentTarget.name]: {
              ...this.state.fields[e.currentTarget.name],
              didBlur: true
            }
          }
        })
      }

      getValidationForField = (definition: FieldDefinition, field: TrackedField): AggregatedValidationResult => {
        const validators = unwrap(definition.validators, this.props) || noValidators
        return validators.reduce<AggregatedValidationResult>((ret, test) => {
          const result = test(field, this.state.fields, this.props)
          ret.isValid = ret.isValid && result.isValid
          if (!result.isValid) ret.messages.push(result.message)
          return ret
        }, { isValid: true, messages: [] })
      }

      collectFormProps = (): FormProp => {

        let errors = noErrors
        let isDirty = false
        let validation = defaultFormValidation

        if (this.formLoaded) {

          errors = flatMap<Array<string>, string>(values(getErrorsFromProps(this.props)), errors => errors)
          isDirty = some<TrackedField>(this.state.fields, (f) => f.originalValue !== f.value)

          validation = reduce<TrackedField, FormValidationResult>(this.state.fields, (ret, field, fieldName) => {
            const result = this.getValidationForField(fieldDefinitions[fieldName], field)
            return {
              isValid: ret.isValid && result.isValid,
              messages: ret.messages.concat(result.messages)
            }
          }, { isValid: true, messages: [] })
        }

        return {
          errors,
          isDirty,
          validation,
          status: this.state.formStatus,
          onSubmit: this.submit,
          updateField: this.updateField,
          submitCount: this.state.submitCount,
          hasSubmitted: this.state.submitCount > 0,
          bulkUpdateFields: this.bulkUpdateFields,
          value: getFormItem(this.state.fields),
        }
      }

      collectFieldProps = (): FieldProp => {
        const errors = getErrorsFromProps(this.props)
        const fields: FieldProp = transform<TrackedField, Field>(this.state.fields, (ret, field, fieldName) => {
          ret[fieldName] = this.getPropsForField(fieldName, errors)
        })
        return fields
      }

      getPropsForField = (fieldName: string, errors: FormErrors): Field => {
        const field = this.state.fields[fieldName]
        const validationResult = this.formLoaded ?
          this.getValidationForField(fieldDefinitions[fieldName], field) :
          { isValid: true, messages: [] }

        return {
          state: {
            ...field,
            ...validationResult,
            isDirty: field.originalValue !== field.value
          },
          errors: errors[fieldName] || noErrors,
          handlers: {
            onChange: this.onFieldChange,
            onBlur: this.onFieldBlur
          },
          props: unwrap(fieldDefinitions[fieldName].props, this.props, field, this.state.fields)
        }
      }

      render() {
        return (
          <Child
            {...this.props}
            form={this.collectFormProps()}
            fields={this.collectFieldProps()}
          />
        )
      }
    }

    hoistNonReactStatics(Enhance, Child)

    return Enhance as React.ComponentClass
  }
}

export const isRequired: ValidatorComposer = (message?) => (field, fields, props) => {
  let result: ValidationResult = { message: null, isValid: true }
  if (!field.value || isNil(field.value)) {
    result.message = message || `${field.name} is required`
  }
  result.isValid = !result.message
  return result
}

export const email: ValidatorComposer = (message?) => (field, fields) => {
  let result: ValidationResult = { message: null, isValid: true }
  if (!isEmail(field.value))
    result.message = message || `${field.name} must be a valid email address`
  result.isValid = !result.message
  return result
}

export const minLength: ValidatorComposer = (length: number, message?) => (field, fields, props) => {
  let result: ValidationResult = { message: null, isValid: true }
  if (field.value && field.value.length < length)
    result.message = message || `${field.name} must be at least ${length} characters`
  result.isValid = !result.message
  return result
}

export const maxLength: ValidatorComposer = (length: number, message?) => (field, fields, props) => {
  let result: ValidationResult = { message: null, isValid: true }
  const val = field.value || ''
  if (field.value && val.length > length)
    result.message = message || `${field.name} must be at most ${length} characters`
  result.isValid = !result.message
  return result
}