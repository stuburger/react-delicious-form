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
  fieldDefinitions: {
    firstName: {
      props: {
        label: 'First name',
        placeholder: 'Enter your first name'
      },
      validators: [

      ]
    }
  },
  mapPropsToFields: (props) => ({}),
  formHasLoaded: (props) => true,
  submit: (formItem, props) => {
    console.log(formItem)
  }
})(TestForm)