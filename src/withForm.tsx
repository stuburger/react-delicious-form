import * as React from 'react'
import {
  transform,
  cloneDeep,
  every,
  isNil,
  isFunction
} from 'lodash'

import { isEmail } from './validate'

export function unwrap<TUnwrapped, P>(item: TUnwrapped | ((props: P) => TUnwrapped), props: P): TUnwrapped {
  return typeof item === 'function' ? item(props) : item
}

export interface Validator {
  /**
   * Validates a form field.
   *
   * @param field The field being validated.
   * @param allFields All tracked form fields.
   * @param props All props
   * @return Validation result
   */
  (field: TrackedField, allFields: TrackedFields, props: any): ValidationResult
}

export interface AggregatedValidationResult {
  isValid: boolean
  messages: Array<string>
}

const validator: Validator = (field, fields, props): ValidationResult => {
  return {
    isValid: true
  }
}

export interface ValidationResult {
  isValid: boolean
  message?: string
}

export type UnwrappedValidatorSet = Array<Validator>

export interface ComputedValidatorSet {
  (props): UnwrappedValidatorSet
}

export type ValidatorSet = UnwrappedValidatorSet | ComputedValidatorSet

export interface ComputedFieldProps<P, FProps> {
  (props: P): FProps
}

export interface FieldDefinition {
  props: ((props) => any) | any // todo
  validators: ValidatorSet
  validateAfter?: 'blur' | 'touched'
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
  WORKING = 'working',
  LOADING = 'loading'
}

export interface FieldState extends TrackedField {
  isDirty: boolean
  isValid: boolean
  messages: Array<string>
}

export interface FieldHandlers {
  onFieldBlur: () => void
  onChange: (any) => void
}

export interface Field {
  state: FieldState
  props: Object
  handlers: FieldHandlers
}

export interface Fields {
  [key: string]: Field
}

export interface FormStateFromFields {
  isDirty: boolean
  validation: FormValidationState
}

export interface FormValidationState {
  isValid: boolean
  errors: Array<string>
}

export interface FormStateForChild {
  validation: FormValidationState
  submit: () => void
  updateField: (fieldName: string, value: any, callback: () => void) => void
  formStatus: FormStatus
  isDirty: boolean
  currentValue: any
}

export interface ComputedFormState {
  fields: Fields
  form: FormStateForChild
}

export interface FormState {
  fields: TrackedFields,
  formStatus: FormStatus
}

export interface FormHOC {
  formHasLoaded: (any) => boolean,
  fieldDefinitions: FormFieldDefinition,
  mapPropsToFields: (props) => any,
  submit: (formItem, props) => void
}

export interface TrackedFields {
  [key: string]: TrackedField
}

export interface TrackedField {
  name: keyof FormFieldDefinition
  value: any | null
  originalValue: any | null
  touched: boolean
  didBlur: boolean
}

export interface SpreadableFieldProps extends TrackedField {
  isValid: boolean
  messages: Array<string>
  showMessages: boolean
  isDirty: boolean
  onChange: (any) => void
  onFieldBlur: (any) => void
  [key: string]: any
}

export interface SpreadableFields {
  [key: string]: SpreadableFieldProps
}

export default function ({
  formHasLoaded = () => false,
  fieldDefinitions,
  mapPropsToFields = () => false,
  submit = () => { }
}: FormHOC) {

  const getInitialState = (props) => {
    const state: FormState = { fields: {}, formStatus: FormStatus.LOADING }
    state.fields = createTrackedFormFields(props)
    if (!formHasLoaded(props)) return state
    state.formStatus = FormStatus.CLEAN
    return state
  }

  const createTrackedFormFields = (props): TrackedFields => {
    const fieldValues = formHasLoaded(props) ? mapPropsToFields(props) : {}
    return transform<FieldDefinition, TrackedField>(fieldDefinitions, (ret, field, key) => {
      ret[key] = {
        name: key,
        value: fieldValues[key] || '',
        originalValue: fieldValues[key] || '',
        touched: false,
        didBlur: false
      }
    })
  }

  const getFieldProps = (props): Object => {
    return transform<FieldDefinition, Object>(fieldDefinitions, (ret, field, key) => {
      ret[key] = unwrap(field.props, props)
    })
  }

  const shouldValidateField = (fieldDef: FieldDefinition, trackedField: TrackedField) => (
    (fieldDef.validateAfter === 'blur' && trackedField.didBlur) ||
    (fieldDef.validateAfter === 'touched' && trackedField.touched)
  )

  const getFormValidators = (props) => {
    return transform<FieldDefinition, any>(fieldDefinitions, (ret, field, key) => {
      const validators = unwrap(field.validators, props)
      ret[key] = {
        validators,
        validate: (trackedField, allTrackedFields, currentProps, force = false) => {
          if (force || shouldValidateField(field, trackedField)) {
            return validators
              .map(test => test(trackedField, allTrackedFields, currentProps))
              .filter(x => !!x)
          }
          return []
        }
      }
    })
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

    return class Form extends React.Component<any, FormState> {

      private formLoaded: boolean

      constructor(props) {
        super(props)
        this.state = getInitialState(props)
        this.formLoaded = this.state.formStatus === FormStatus.CLEAN
      }

      componentWillReceiveProps(nextProps, nextState) {
        if (!this.formLoaded && formHasLoaded(nextProps)) {
          this.setState(getInitialState(nextProps))
        }

        if (!this.props.fetching && nextProps.fetching) {
          return this.setState({ formStatus: FormStatus.LOADING })
        }

        if (!this.props.submitting && nextProps.submitting) {
          return this.setState({ formStatus: FormStatus.WORKING })
        }

        if (this.props.submitting && !nextProps.submitting) {

          // todo - server error handling?
          return this.setState(prevState => ({
            formStatus: FormStatus.CLEAN,
            fields: untouchAllFields(this.state.fields)
          }))

          // return this.setState({ formStatus: 'touched' })
        }
      }

      updateField = (fieldName, value, callback?) => {
        if (this.isFormDisabled()) return
        const field = cloneDeep(this.state.fields[fieldName])
        field.value = value
        field.touched = true
        const fields = cloneDeep(this.state.fields)
        fields[fieldName] = field
        this.setState(prevState => ({ fields, formStatus: FormStatus.TOUCHED }), callback)
      }

      isFormDisabled() {
        return /loading|working/.test(this.state.formStatus)
      }

      submit = () => {
        if (this.isFormDisabled()) return
        this.setState({
          fields: touchAllFields(this.state.fields)
        }, () => {
          submit(getFormItem(this.state.fields), this.props)
        })
      }

      getFieldValidationResult = (definition: FieldDefinition, field: TrackedField): AggregatedValidationResult => {
        const validators = unwrap(definition.validators, this.props)
        return validators.reduce<AggregatedValidationResult>((ret, test) => {
          const result = test(field, this.state.fields, this.props)
          ret.isValid = ret.isValid && result.isValid
          if (!result.isValid) ret.messages.push(result.message)
          return ret
        }, { isValid: true, messages: [] })
      }

      createChildProps = (): ComputedFormState => {
        const { fields: trackedFields, formStatus } = this.state

        const form: FormStateForChild = {
          isDirty: true,
          formStatus: this.state.formStatus,
          submit: this.submit,
          updateField: this.updateField,
          currentValue: this.getFormItem(),
          validation: {
            isValid: true,
            errors: []
          }
        }

        const fields: Fields = {}

        for (let fieldName in trackedFields) {
          const trackedField = trackedFields[fieldName]
          const validationResult = this.getFieldValidationResult(fieldDefinitions[fieldName], trackedField)
          const isDirty = trackedField.originalValue !== trackedField.value

          fields[fieldName] = {
            state: {
              isDirty,
              ...trackedField,
              ...validationResult,
            },
            handlers: {
              onChange: (value) => {
                this.updateField(fieldName, value)
              },
              onFieldBlur: () => {
                this.setState({
                  fields: {
                    ...trackedFields,
                    [fieldName]: {
                      ...cloneDeep(trackedFields[fieldName]),
                      didBlur: true
                    }
                  }
                })
              }
            },
            props: unwrap(fieldDefinitions[fieldName].props, this.props)
          }

          form.isDirty = isDirty || form.isDirty
          form.validation.isValid = validationResult.isValid && form.validation.isValid
          form.validation.errors = form.validation.errors.concat(validationResult.messages)
        }

        return {
          fields,
          form
        }
      }

      render() {

        const { fields, formStatus } = this.state

        return (
          <Child
            {...this.props}
            {...this.createChildProps() }
          />
        )
      }
    }
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