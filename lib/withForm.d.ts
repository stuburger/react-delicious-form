/// <reference types="react" />
import * as React from 'react';
export declare function unwrap<TUnwrapped, P>(item: TUnwrapped | ((props: P, field?: TrackedField, fields?: TrackedFields) => TUnwrapped), props: P, field?: TrackedField, fields?: TrackedFields): TUnwrapped;
export interface Validator {
    /**
     * Validates a form field.
     *
     * @param field The field being validated.
     * @param allFields All form fields.
     * @param props All incoming `props`
     * @return {ValidationResult}
     */
    (field: TrackedField, allFields: TrackedFields, props: any): ValidationResult;
}
export interface AggregatedValidationResult {
    isValid: boolean;
    messages: Array<string>;
}
export interface ValidationResult {
    /**
     * The result of validating a field
     * @typedef {Object} ValidationResult
     * @property {boolean} isValid A value indicating if this field is valid or not
     * @property {string} message A validation message if isValid is false
     */
    isValid: boolean;
    message?: string;
}
export interface FormValidationResult {
    isValid: boolean;
    messages: Array<string>;
}
export declare type UnwrappedValidatorSet = Array<Validator>;
export interface ComputedValidatorSet {
    /**
     * An alternative way to define validators for this field for convenience. Use this if you want easy
     * access to props in all your validators.
     * @param props All incoming `props`. These are the same props available (3rd argument) in every validator function
     * @return An array of validators
     */
    (props: any): UnwrappedValidatorSet;
}
export declare type ValidatorSet = UnwrappedValidatorSet | ComputedValidatorSet;
export interface ReadWriteSpec {
    /**
     * A transform function which maps other field values to this field.
     *
     * @param fields All form fields
     * @return The value that this field be given
     */
    read?: (fields: TrackedFields) => any;
    /**
     * A transform function which accepts a value and returns an object, the keys of which
     * match the keys of other fields on the form.
     *
     * @param value The incoming value
     * @return An object which should be mapped onto matching form fields.
     */
    write?: (value: any) => any;
}
export interface ComputedProps {
    /**
     * Maps incoming props to this field.
     *
     * @param props All incoming `props`
     * @return Computed field props which will be available in your component via `this.props.fields.[yourFieldName].props`
     */
    (props: any): any;
}
export interface FieldDefinition {
    /**
     * Maps incoming props to this field.
     *
     * These are the props which will become available in your component via `this.props.fields.[yourFieldName].props`
     * this can either be a plain object or a function that maps incoming `props` to the props you wish be be made
     * available to this field.
     */
    props?: ComputedProps | any;
    /**
     * Used to transform the value that this field will become
     */
    computed?: ReadWriteSpec;
    /**
     * Specifies the validators for this field. Must take the form of either an array of validators or a function that returns an array of validators
     */
    validators?: ValidatorSet;
    /**
     * Specifies the initial value for this field that should be set when the form is loaded.
     * Takes priority the value received for this field in `mapPropsToFields`. Can be a function or a static value
     */
    initialValue?: ((props) => any) | any;
}
export interface FormFieldDefinition {
    [key: string]: FieldDefinition;
}
export interface ValidatorComposer {
    (...parms: any[]): Validator;
}
export declare enum FormStatus {
    CLEAN = "clean",
    TOUCHED = "touched",
    SUBMITTING = "submitting",
    LOADING = "loading",
}
export interface FieldState extends TrackedField {
    isDirty: boolean;
    isValid: boolean;
    messages: Array<string>;
}
export interface FieldHandlers {
    onBlur: (e: React.FormEvent<Element>) => void;
    onChange: (e: React.FormEvent<Element> | React.ChangeEvent<Element>) => void;
}
export interface Field {
    state: FieldState;
    errors: any;
    props: any;
    handlers: FieldHandlers;
}
export interface FieldProp {
    [key: string]: Field;
}
export interface FormStateFromFields {
    isDirty: boolean;
    validation: FormValidationState;
}
export interface FormValidationState {
    isValid: boolean;
    messages: Array<string>;
}
export interface FormProp {
    validation: FormValidationState;
    onSubmit: (context?) => any;
    clear: () => void;
    updateField: (fieldName: string, value: any) => void;
    bulkUpdateFields: (partialUpdate: any) => void;
    status: FormStatus;
    isDirty: boolean;
    value: any;
    submitCount: number;
    hasSubmitted: boolean;
    errors: Array<string>;
}
export interface ComputedFormState {
    fields: FieldProp;
    form: FormProp;
}
export interface FormState {
    submitCount: number;
    fields: TrackedFields;
    formStatus: FormStatus;
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
    formHasFinishedLoadingWhen?: (any) => boolean;
    /**
     * A function which accepts all incoming props and returns a boolean indicating whether the form is busy submitting.
     * This will affect form.status - When the form is submitting `form.status === 'submitting'`.
     *
     * NB The form will be disabled until this function returns true
     */
    formIsSubmittingWhen?: (any) => boolean;
    /**
     * The field definitions for this form. Used to specify props and validation for each field.
     */
    fields: FormFieldDefinition;
    /**
     * Maps incoming props to the fields definied by `fieldDefinitions`.
     * Must return an object whose keys match the keys defined in `fieldDefinitions`.
     * Unrecognized keys will not be mapped to any field.
     *
     * This function will only be called once `formHasFinishedLoadingWhen` returns true.
     */
    mapPropsToFields?: (props) => any;
    /**
     * Maps incoming props to errors. This is intended to map server-side validation to the fields on the form.
     * Must return an object whose keys match the keys defined in fieldDefinitions. Unrecognized keys will not be mapped to any field,
     * however all values will be available in your component in `this.props.form.errors` which is useful for displaying errors that do not relate
     * to any field in particular.
     *
     * NB These errors are not held within form state and you are responsible for clearing these error messages from whatever store they are kept in.
     */
    mapPropsToErrors?: (props) => FormErrors;
    /**
     * The function that should called when submitting your form.
     * Accepts
     * @param formValue the value associated with this form.
     * @param props all incoming `props`
     * @param context any data that might be specific to the context of your component that would not be available on `form.value` or `props` which
     * can be passed to the `onSubmit` function that is available via `this.props.form.onSubmit`
     */
    onSubmit: (formValue, props, context) => any;
}
export interface TrackedFields {
    [key: string]: TrackedField;
}
export interface FormErrors {
    [key: string]: Array<string>;
}
export interface TrackedField {
    name: keyof FormFieldDefinition;
    value: any | null;
    originalValue: any | null;
    touched: boolean;
    didBlur: boolean;
}
export default function ({formHasFinishedLoadingWhen, formIsSubmittingWhen, fields: fieldDefinitions, mapPropsToFields, mapPropsToErrors, onSubmit}: FormDefinition): (Child: any) => React.ComponentClass<{}>;
export declare const isRequired: ValidatorComposer;
export declare const email: ValidatorComposer;
export declare const minLength: ValidatorComposer;
export declare const maxLength: ValidatorComposer;
