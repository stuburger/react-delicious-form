import * as React from 'react'
import withForm, { ComputedFormState } from './src/withForm'

interface TestFormProps extends ComputedFormState {

}

class TestForm extends React.Component<TestFormProps, any>{

  render() {

    const { fields, form } = this.props

    return (
      <input
        {...fields.firstName.handlers}
        {...fields.firstName.state}
        {...fields.firstName.props}
      />
    )
  }

}

export default withForm({
  fieldDefinitions: { // define your fields
    firstName: {
      props: { // available via this.props.fields.firstName.props
        label: 'First name',
        placeholder: 'Enter your first name',
        // ...
      },
      validators: (props) => {
        return [] 
      },
      initialValue: ''
    },
    lastName: {
      props: (props) => {
        return ''
      }
    }
  },

  formHasFinishedLoadingWhen: (props) => !props.user.isFetching && props.refData.hasLoaded,

  mapPropsToFields: (props) => ({ // called once formHasFinishedLoadingWhen returns true
    firstName: props.user.firstName,
    //  ...
  }),

  formIsSubmittingWhen: (props) => props.user.submitting,

  onSubmit: (formItem, props) => { // available on your component via this.props.form.onSubmit
    if (props.someResourceId)
      props.updateSomeResource(props.someResourceId, formItem)
    else
      props.updateSomeResource(formItem)
  },

  mapPropsToErrors: (props) => ({
    firstName: props.errors.firstName, // must be an array of strings for each field
    // ...
  })

})(TestForm)