# react-delicious-form
A react library created to make working with forms, like, totally delicious.

### N.B. This read me is a work in progress

## Installation

`npm install --save react-delicious-form`

## In the wild

### Basic Usage

Basic usage requires the `withForm` higher order component. withForm takes a single 'descriptor' object parameter which describes your form and decorates your form component accordingly. This is where you will define the fields that your form will contain and how your form should map incoming props to these fields. Here you will also tell your component that your `formHasFinishedLoadingWhen` a condition so that it can proceed to `mapPropsToFields` which will populate your form with initial values if you have provided any. Tell your form to understand when it is submitting by supplying the `formIsSubmittingWhen` function. 

```js
import withForm from 'react-delicious-form'

class TestForm extends Component {

  render() {
    const { fields, form } = this.props
    return (
      <div>
        <input
          {...fields.firstName.handlers}
          {...fields.firstName.state}
          {...fields.firstName.props}
        />
      <div>
    )
  }
}
```

Then wrap your form component and export

```js
export default withForm({

  fieldDefinitions: { // define your fields
    firstName: {
      props: { // available on your component via this.props.fields.firstName.props
        label: 'First name',
        placeholder: 'Enter your first name',
        ...
      }
    }
    ...
  },

  formHasFinishedLoadingWhen: (props) => !props.user.isFetching && props.refData.hasLoaded,

  mapPropsToFields: (props) => ({ // called once formHasFinishedLoadingWhen returns true
    firstName: props.user.firstName,
    ...
  }),

  formIsSubmittingWhen: (props) => props.user.submitting,

  onSubmit: (formItem, props) => { // available on your component via this.props.form.submit
    if (props.someResourceId)
      props.updateSomeResource(props.someResourceId, formItem)
    else
      props.updateSomeResource(formItem)
  },

  mapPropsToErrors: (props) => ({
    firstName: props.errors.firstName, // must be an array of strings for each field
    ...
  })

})(TestForm)
```
