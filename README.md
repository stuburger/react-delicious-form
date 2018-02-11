# react-delicious-form
A _new_ react library created to make working with forms, like, totally delicious.<br>

**Motivation for yet another Form library**

The goal of `react-delicious-form` is to provide a flexible way to create forms in React and does not tie you to any state management library. It also does not provide any components out of the box (although it does provide small number of simple validation helper functions).

The API is simple and the props that it decorates your component with should be straight forward to use. The default export of `react-delicious-form` is a single _higher-order-component_ which should provide you with everything you'll need in order to make an awesome form. However, this library tries not to use any _magic_ to accomplish this; input components will not magically appear - it is left up to you to build your own Input components. Form submission is not prevented by default, for example - you will have to decide under what circumstances it is okay to submit your form, display validation messages or otherwise show the user what state your form is currently in. This allows for: 
1.  a natural way to build your forms
2.  the opportunity to move form logic out of your component and into a pure .js file (with no jsx)
3.  an easy and highly customizable form components, the implementation of which is left up to you.

## Bugs

This is a new library so if you bump into any bugs then please report them [here](https://github.com/stuburger/react-delicious-form/issues). If you have any feature requests feel free to add them!

## Installation

`npm install --save react-delicious-form`

## In the wild

### Basic Usage

```js
// MyFormComponent.js

import withExampleForm from './exampleForm'
 // The creation of an Input component is left up to you - for now. 
 // You'll find an example of how you might create an Input component that 
 // makes use of the props created by the withForm HOC
import { Input } from 'shared/components'

class MyFormComponent extends Component {

  render() {
    const { fields, form } = this.props
    return (
      <form onSubmit={form.onSubmit}>
        <Input {...fields.firstName} />
        <input type="submit" value="Save" />
      </div>
    )
  }
}

// wrap your form component and export.
export default withExampleForm(MyFormComponent)
```



```js
// withExampleForm.js

const withExampleForm = withForm({

  fields: { // define your fields
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

  onSubmit: (formItem, props, context) => { // available on your component via this.props.form.submit
    if (props.someResourceId)
      props.updateSomeResource(props.someResourceId, formItem)
    else
      props.createSomeResource(formItem)
  },

  mapPropsToErrors: (props) => ({
    firstName: props.errors.firstName, // must be an array of strings for each field
    ...
  })

})

export default withExampleForm
```

# API
## `withForm` (**higher-order-component**)

  - arguments:
    - [**FormDefinition**](https://github.com/stuburger/react-delicious-form/blob/3a12d2a1b7c9c52ac506b6e8da99caa9f012b9ab/src/withForm.tsx#L180) *object*
      - `fields`
      - `formHasFinishedLoadingWhen`
      - `mapPropsToFields`
      - `onSubmit`
      - `formIsSubmittingWhen`
      - `mapPropsToErrors`
  - returns a **component** decorated with [**form**](https://github.com/stuburger/react-delicious-form/blob/61eb42d456bb0a8e255113a4bda881b54ebbd633/lib/withForm.d.ts#L110) and [**fields**](https://github.com/stuburger/react-delicious-form/blob/61eb42d456bb0a8e255113a4bda881b54ebbd633/lib/withForm.d.ts#L99) props

## Configuration 
### Overview of `FormDefinition` 

| Property        | Type           | Description  |
| ------------- |-------------| -----|
| `fields`      | **object** | The field definitions for this form. Used to specify props and validation for each field. Click [**here**](https://github.com/stuburger/react-delicious-form/blob/61eb42d456bb0a8e255113a4bda881b54ebbd633/lib/withForm.d.ts#L53) to see what each field definition is comprised of. |
| `formHasFinishedLoadingWhen(props)`      | **function** |   A function which accepts all incoming props and returns a boolean indicating whether the form has finished loading. `mapPropsToFields` will not be called untils `formHasFinishedLoadingWhen` function returns `true`. Specifies when all the data has finished loading for this form and hence when initial values can be mapped. The return value of `formHasFinishedLoadingWhen` affects `form.status` - while the form is loading `form.status === 'loading'` **NB:** The form will be disabled until this function returns `true`. |
| `mapPropsToFields(props)` | **function**  | Maps incoming props to the fields definied by `fields`. Must return an object whose keys match the keys defined in `fields`. Unrecognized keys will not be mapped to any field. This function will only be called once `formHasFinishedLoadingWhen` returns `true`. |
| `onSubmit(formValue, props, context)` | **function** | Maps incoming props to the fields definied by `fields`. Must return an object whose keys match the keys defined in `fields`. Unrecognized keys will not be mapped to any field. This function will only be called once `formHasFinishedLoadingWhen` returns `true`. |
| `formIsSubmittingWhen(props)` | **function** | The field definitions for this form. Used to specify props and validation for each field. |
| `mapPropsToErrors(props)` | **function** | Maps incoming props to errors. This is intended to map server-side validation to the fields on the form. Must return an object whose keys match the keys defined in fields. Unrecognized keys will not be mapped to any field, however all values will be available in your component in `this.props.form.errors` which is useful for displaying errors that do not relate to any field in particular. The value of each key must be a simple `string[]` containing error messages for that field. |

### `FormDefinition.fields`

For every FieldDefinition you can supply 3 optional properties.
1. `props` - there are 2 possible ways provide these:
  - As satic values

```js
firstName: {
  props: {
    label: 'First name',
    style: { color: '#000' }
  }
}

// `fields.firstName.props` contains the keys `label` and `style`
```

- Using a function
```js
// A function that accepts incoming props and returns an object which contains the props for this field.
// Useful if you need to compute these values based on some props being passed into your component
firstName: {
  props: (props) => ({
    label: props.getIntl('user.country.label'),
    placeholder: props.getIntl('user.country.placeholder'),
    className: props.currentModule.theme.input,
    options: props.countries
  })
}

// `fields.country.props` contains the keys `label`, `placeholder`, `className` and `options`
```

2. `validators` - a list of validator functions that are used to determine whether the field `isValid` or not. There are a small number of validator functions that come with `react-delicious-form`. If message is provided a default message is given.
```js
import withform, { email, isRequired, minLength, maxLength } from 'react-delicious-form'
...
firstName: {
  ...
  validators: [
    isRequired(),
    minLength(3, 'First name must be at least 3 characters')
  ]
}
...
```

- Similar to the way you can provide a function to compute props, the same can be done for validators:
```js
firstName: {
  ...
  validators: (props) => ([
    isRequired(props.getIntl('firstName.validation.required')),
    minLength(props.minNameLength, props.getIntl('firstName.validation.minLength', props.minNameLength))
  ])
}
```

- It is also possible to define your own validators. Each validator is a function which can accept up to 3 arguments in the following order `field`, `allFields`, `props`.<br>Each validator must return a [**ValidationResult**](https://github.com/stuburger/react-delicious-form/blob/61eb42d456bb0a8e255113a4bda881b54ebbd633/lib/withForm.d.ts#L19) object containing an `isValid` value and a `message` (if `isValid === false` this is the message that will be presented) 
```js

// passwordValidators.js
const checkPasswordStrength = (field, allFields, props) => {
  const isValid = SOME_COMPLEX_REG_EX.test(field.value)
  return {
    isValid,
    message: isValid ? undefined : 'Your password isnt strong enough'
  }
}

const checkPasswordsMatch = (field, allFields, props) => {
  const isValid = field.value === allFields.password.value
  return {
    isValid,
    message: isValid ? undefined : 'Passwords do not match'
  }
}

// LoginForm.js
...
fields: {
  password: {
    props: {
      label: 'Password',
      type: 'password'
    },
    validators: [
      isRequired('Password is required')
      checkPasswordStrength
    ]
  },
  confirmPassword: {
    props: {
      label: 'Confirm password',
      type: 'password'
     },
     validators: [
      checkPasswordsMatch
    ]
  }
}

```

3. `initialValue` - an optional value to be used as the initial value for this field
  - As with `props` and `validators` this can either be a static value or a function that maps incoming props to this field.<br>**Note** this takes priority over any value supplied for this field in `mapPropsToFields`. As with `mapPropsToFields`, if initial value is a function it will only be used to set `initialValue` once `formHasFinishedLoadingWhen` returns `true`

```js
countryOfBirth: {
  props: {
    label: 'Select $#*! hole country',
    options: [
      'South Africa',
      'Zimbabwe',
      'Nambia'
    ]
  },
  initialValue: (props) => props.user.countryOfBirth
  // alternatively you can use a static value
  // initialValue: 'South Africa'
},
...
```

### `FormDefinition.formHasFinishedLoadingWhen(props)`

- `formHasFinishedLoadingWhen` is an **optional** function which tells your form when it is ready to receive props and map them to the form fields.<br>If this function is supplied you will not be able update any form values until this `formHasFinishedLoadingWhen` returns `true`. If this function is not supplied the form will be will be considered loaded by default.

```js
...
formHasFinishedLoadingWhen: (props) => props.formType === 'create' || !props.fetching
...

```

### `FormDefinition.mapPropsToFields(props)`

- `mapPropsToFields` is a function that should return a plain object whose keys match those defined by `FormDefinition.fields`. If this function is not supplied default values will be assigned to each field

```js
...
mapPropsToFields: (props) => {
  if(props.formType === 'edit') {
    return props.user
  }
  // no need to return any values for the form is there are none
}
...
```

### `FormDefinition.formIsSubmittingWhen(props)`

- onSubmit is a function that maps incoming props to a boolean values that tells the form when it in `'submitting'` state. This is useful to disable buttons on your form, or to show a loader of some kind to your users.

```js
...
formIsSubmittingWhen: (props) => props.isSubmitting
...
```

### `FormDefinition.onSubmit(formValue, props, context)`

- onSubmit is a function that accepts 3 arguments. 
  - `formValue` - the current value of the form
  - `props` - all props passed to your component from its parent
  - `context` - a wild card value which can be passed to this function from your component. This is useful if you have some local state in your form that needs to be available when submitting your form.

See contrived example below:
```js
...
onSubmit: (formValue, props, context) => {
  if(context.isRegistration) {
    props.createAccount(formValue)
  } else {
    props.login(formValue)
  }
}
...

// this can then be called in your component like so:

class AuthForm extends Component {
  state = { isRegistration: true }

  ...
  submit = () => {
    const { onSubmit } = this.props.form
    onSubmit(this.state)
  }

  render() {
    return (
      <div className="login-form">
  
        ...
  
        <input type="button" onClick={this.submit} />
      </div>
    )
  }
}
```

### `FormDefinition.mapPropsToErrors`

Maps incoming props to errors. This is intended to map server-side validation to the fields on the form. Must return an object whose keys match the keys defined in fields. Unrecognized keys will not be mapped to any field, however all values will be available in your component in `this.props.form.errors` which is useful for displaying errors that do not relate to any field in particular. The value of each key must be a simple `string[]` containing error messages for that field. If any errors can be mapped they can be accessed via `this.props.fields[someCoolFieldName].errors`.<br>Note that `mapPropsToErrors` does not store these errors in any state, it simply maps them to your fields, therefore you are responsible for clearing our any error messages from whatever they are stored. Also note that these errors will be displayed regardless of whether the user has attempted submitting the form or not. Errors will be mapped as soon as they are found on `props`.

```js
...
mapPropsToErrors: (props) => ({
    ...props.serverErrors,
    firstName: props.serverErrors.fName, // must be an array of strings for each field
})
...
```

## Example - Defining form fields 

```js
// UserForm.js
import withForm, { isRequired, minLength } from 'react-delicious-form'
import { Input } from 'shared/components'

export default withForm({
  fields: { // FieldDefinitions
    firstName: {
      props: {
        label: 'First name',
        style: { color: '#000' }
      },
      validators: [
        isRequired('First name is required'),
        minLength(3, 'First name must be at least 3 characters')
      ],
      initialValue: ''
    }
    ...
  },
  ...
})(({ form, fields }) => (
  <form onSubmit={form.onSubmit}>

    // Flatten each field can be useful for when making use of PureComponent
    <Input
      {...fields.firstName.handlers}
      {...fields.firstName.state}
      {...fields.firstName.props}
    />

    <input 
      type="submit" 
      value="Save User" 
      disabled={!form.validation.isValid || form.status === 'submitting'} 
    />

  </form>
))
```

## Using the `fields` and `form` props in your component

These are the only two objects that the `withForm` hoc adds to your component. Together they contain the functions and state that you'll need to work with forms.<br>
These props can be accessed in your component as follows:

```js
const { fields, form } = this.props // for class components
const { fields, form } = props // for stateless components
```

### Working with `this.props.fields`

[**fields**](https://github.com/stuburger/react-delicious-form/blob/61eb42d456bb0a8e255113a4bda881b54ebbd633/lib/withForm.d.ts#L99) is a simple object, the keys of which correspond to the `fields: ` config object that you defined in the `withForm` hoc.<br>The value of each [**field**](https://github.com/stuburger/react-delicious-form/blob/61eb42d456bb0a8e255113a4bda881b54ebbd633/lib/withForm.d.ts#L93) is defined below:

- The [**state**](https://github.com/stuburger/react-delicious-form/blob/61eb42d456bb0a8e255113a4bda881b54ebbd633/lib/withForm.d.ts#L84) property

This contains the state of a field which is made up of following values

| Property | Type | Description  |
| -------- | ---- | ----------   |
| `name` | **string**  | The key - whatever you've named it. i.e.<br>`console.log(fields.firstName.state.name) // firstName`
| `value` | **any** | The current value of this field
| `originalValue` | **any** | The initial value of this field.<br>Equal to `''` or whatever `mapPropsToFields` returned for this field
| `touched` | **boolean** | `true` if the `value` of this field has changed at least once. Not the same as `isDirty`.<br>A field will still be touched even if `value` is changed back to `originalValue`
| `didBlur` | **boolean** | `true` if the input that controls this field has gained and lost focus at least once
| `isDirty` | **boolean** | `true` whenever `value !== originalvalue`, otherwise `false`
| `isValid` | **boolean** | `true` if all validation defined in `validators` passes, otherwise `false`
| `messages` | **string[]**| An array of strings which contains all the validation messages for this field. `messages` will be empty if `isValid === 'true'`

- The **props** property

This simply contains the props that you defined for the field in the `FieldDefinition` wish to `{...spread}` on to your input and is a convient way to define the props any given input field.<br>

#### A note about using the `{...}` spread operator:

Be careful not to spread props onto an HTML input without checking that all the props passed to it belong on said element,<br>
otherwise React is likely to give you a warning. It is recommended that you create<br>
your own `Input` components that know what to do with the props that are being passed to them. You can find an example of this further down on this page.

- The [**handlers**](https://github.com/stuburger/react-delicious-form/blob/61eb42d456bb0a8e255113a4bda881b54ebbd633/lib/withForm.d.ts#L89) property

This contains two important functions:
- `onChange(e)`
- `onBlur(e)`

These handlers are **crucial** and should should be given to your `Input` component so that it knows how and when to update the fields `state`.<br>

#### A note about `handlers`:

Both `onChange` and `onBlur` must be passed the event parameter since state for every field is changed using `event.currentTarget.name`.<br>
If you wish to update the fields value manually you will have to use the `updateField` or `bulkUpdateFields` functions which are made available on the `form` prop<br>


## Working with `this.props.form`

The second prop that is made available to your component is the [**form**](https://github.com/stuburger/react-delicious-form/blob/61eb42d456bb0a8e255113a4bda881b54ebbd633/lib/withForm.d.ts#L110) object:

| Property | Type | Description |
| --- | --- | --- |
| `validation` | **object** | Contains the validation state of the entire form |
| `onSubmit` | **function** | The function used to to submit your form. It accepts a single optional parameter which is passed to `onSubmit` (3rd argument) on your `FormDefinition` config when defining your form. _NB_ Do not get confused by `onSubmit` (a function which is a property of the `FormDefinition` object), and `form.onSubmit(context)` function which is ultimately made available to your component via the `form` prop. |
| `updateField` | **function** | A function used to update a single field.
| `bulkUpdateFields` | **function** | A function used to update multiple fields simultaneously. |
| `status` | **string** | `'loading'`, `'submitting'`, `'touched'`, `'clean'` |
| `isDirty` | **boolean** | `true` if any one or more field's `isDirty` flag is also `true` |
| `value` | **object** | An object containing current value of the form |
| `errors` | **string[]** | A flattened list of errors based on the values of the object return by `mapPropsToErrors` |
| `submitCount` | **number** | A number indicating the number of times the onSubmit method has been called` |
| `hasSubmitted` | **boolean** | A value indicating whether the user has attempted to submit this form at least once. `hasSubmitted` will be `true` if `submitCount > 0`, otherwise `false` |


## Example - updateField, bulkUpdateFields

```js
// updates a single field
form.updateField('firstName', 'Munk')

// update multiple fields at the same time 
form.bulkUpdateFields({
  firstName: 'Munk',
  lastName: 'Jones'
})
```

## Example - creating inputs for your form

Below is an example of what an Input and a FormSubmit component might look like. You can use the state of a field to determine when and how to display validation messages. Use form state to alter what class is applied to a button, etc. Feel free to copy paste!

```js
// Input.js

export default Input = ({
  reff,
  label = '',
  name,
  placeholder,
  onChange = () => { },
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
    <div className="form-group">
      <label
        htmlFor={name}
        className="control-label"
      >
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
```

```js
// FormSubmit.js
const defaultButtonText = {
  clean: 'Saved',
  loading: 'Loading',
  touched: 'Save',
  submitting: 'Saving'
}

class FormSubmit extends PureComponent {

  render() {

    const {
      onClick,
      className,
      disabled = false,
      formStatus = 'touched',
      buttonText = defaultButtonText, 
      ...props } = this.props

    return (
      <button
        onClick={onClick}
        className={className}
        disabled={disabled}
        {...props}
      >
        {buttonText[formStatus]}
      </button>
    )
  }
}

export default FormSubmit
```

```js
// Form.js
import { Input, FormSubmit } from 'src/shared/components' // or what have you

class MyForm extends Component {

  render() {
    const { fields, form } = this.props
    return (
      ...
      <Input
        {...fields.registrationNumber.handlers}
        {...fields.registrationNumber.state}
        {...fields.registrationNumber.props}
      />
      <FormSubmit
        onClick={form.submit}
        formStatus={form.status}
      />
      ...
    )
  }
}

export withForm({
  ...
})(MyForm)

```
