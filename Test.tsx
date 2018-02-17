import * as React from 'react'
import withForm, { ComputedFormState } from './src/withForm'

interface TestFormProps extends ComputedFormState {}

class TestForm extends React.Component<TestFormProps, any> {
  render() {
    const { fields, form } = this.props

    return <input {...fields.firstName.handlers} {...fields.firstName.state} {...fields.firstName.props} />
  }
}

export default withForm({
  fields: {
    firstName: {
      props: {
        label: 'First name'
      },
    },
    lastName: {
      props: {
        label: 'Last name'
      },
    },
    fullName: {
      props: {
        label: 'Full name'
      },
      computed: {
        read: (fields) => fields.firstName.value + ' ' + fields.lastName.value,
        write: (value: string) => {
          const split = value.split(' ')
          return {
            firstName: split[0],
            lastName: split[1]
          }
        }
      },
      validators: [
        (field, fields, props) => {
          if (field.value.length < 3) {
            return {
              isValid: false,
              message: 'First name must be at least 3 characters'
            }
          }
          return { isValid: true }
        }
      ],
      initialValue: ''
    }
  },

  formHasFinishedLoadingWhen: props => !props.user.isFetching && props.refData.hasLoaded,

  mapPropsToFields: props => ({
    // called once formHasFinishedLoadingWhen returns true
    firstName: props.user.firstName
    //  ...
  }),

  formIsSubmittingWhen: props => props.user.submitting,

  onSubmit: (formItem, props) => {
    // available on your component via this.props.form.onSubmit
    if (props.someResourceId) props.updateSomeResource(props.someResourceId, formItem)
    else props.updateSomeResource(formItem)
  },

  mapPropsToErrors: props => ({
    firstName: props.errors.firstName // must be an array of strings for each field
    // ...
  })
})(TestForm)

export const Input = ({
  reff,
  label = '',
  name,
  placeholder,
  onChange = () => {},
  isDirty,
  value,
  disabled = false,
  className,
  errors = [],
  isValid = true,
  messages,
  touched = false,
  didBlur = false,
  onBlur = () => false,
  showMessages = messages.length > 0 && didBlur && touched,
  originalValue,
  required,
  ...props
}) => (
  <div>
    <label htmlFor={name} className="control-label">
      {label}
    </label>
    <input
      name={name}
      className="form-control"
      ref={reff}
      disabled={disabled}
      placeholder={placeholder}
      onChange={onChange}
      value={value}
      aria-describedby={name}
      onBlur={onBlur}
      {...props}
    />
    {showMessages && (
      <span id={name} style={{ fontSize: 10, color: 'red' }}>
        {messages[0]}
      </span>
    )}
  </div>
)
