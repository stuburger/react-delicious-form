/// <reference types="react" />
import * as React from 'react';
export declare function unwrap<TUnwrapped, P>(item: TUnwrapped | ((props: P) => TUnwrapped), props: P): TUnwrapped;
export interface Validator {
    (field: TrackedField, allFields: TrackedFields, props: any): ValidationResult;
}
export interface AggregatedValidationResult {
    isValid: boolean;
    messages: Array<string>;
}
export interface ValidationResult {
    isValid: boolean;
    message?: string;
}
export declare type UnwrappedValidatorSet = Array<Validator>;
export interface ComputedValidatorSet {
    (props: any): UnwrappedValidatorSet;
}
export declare type ValidatorSet = UnwrappedValidatorSet | ComputedValidatorSet;
export interface ComputedFieldProps<P, FProps> {
    (props: P): FProps;
}
export interface FieldDefinition {
    props: ((props) => any) | any;
    validators?: ValidatorSet;
    validateAfter?: 'blur' | 'touched';
    initialValue: ((props) => any) | any;
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
    WORKING = "working",
    LOADING = "loading",
}
export interface FieldState extends TrackedField {
    isDirty: boolean;
    isValid: boolean;
    messages: Array<string>;
}
export interface FieldHandlers {
    onFieldBlur: () => void;
    onChange: (e: any) => void;
}
export interface Field {
    state: FieldState;
    errors: any;
    props: Object;
    handlers: FieldHandlers;
}
export interface Fields {
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
export interface FormStateForChild {
    validation: FormValidationState;
    submit: (context?) => void;
    updateField: (fieldName: string, value: any, callback?: () => void) => void;
    bulkUpdateFields: (partialUpdate: Object) => void;
    formStatus: FormStatus;
    isDirty: boolean;
    currentValue: any;
    errors: Array<string>;
}
export interface ComputedFormState {
    fields: Fields;
    form: FormStateForChild;
}
export interface FormState {
    fields: TrackedFields;
    formStatus: FormStatus;
}
export interface FormHOC {
    formHasFinishedLoadingWhen: (any) => boolean;
    formIsSubmittingWhen: (any) => boolean;
    fieldDefinitions: FormFieldDefinition;
    mapPropsToFields: (props) => any;
    mapPropsToErrors: (props) => FormErrors;
    submit: (formItem, props, context) => void;
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
export interface SpreadableFieldProps extends TrackedField {
    isValid: boolean;
    messages: Array<string>;
    showMessages: boolean;
    isDirty: boolean;
    onChange: (any) => void;
    onFieldBlur: (any) => void;
    [key: string]: any;
}
export interface SpreadableFields {
    [key: string]: SpreadableFieldProps;
}
export default function ({formHasFinishedLoadingWhen, formIsSubmittingWhen, fieldDefinitions, mapPropsToFields, mapPropsToErrors, submit}: FormHOC): (Child: any) => {
    new (props: any): {
        formLoaded: boolean;
        componentWillReceiveProps(nextProps: any, nextState: any): void;
        updateField: (fieldName: any, value: any, callback?: any) => void;
        bulkUpdateFields: (partialUpdate: Object) => void;
        submit: (context: any) => void;
        onFieldChange: (e: any) => void;
        getFieldValidationResult: (definition: FieldDefinition, field: TrackedField) => AggregatedValidationResult;
        createChildProps: () => ComputedFormState;
        render(): JSX.Element;
        setState<K extends "fields" | "formStatus">(state: FormState | ((prevState: Readonly<FormState>, props: any) => FormState | Pick<FormState, K>) | Pick<FormState, K>, callback?: () => void): void;
        forceUpdate(callBack?: () => void): void;
        props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<any>;
        state: Readonly<FormState>;
        context: any;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentWillMount?(): void;
        componentDidMount?(): void;
        shouldComponentUpdate?(nextProps: Readonly<any>, nextState: Readonly<FormState>, nextContext: any): boolean;
        componentWillUpdate?(nextProps: Readonly<any>, nextState: Readonly<FormState>, nextContext: any): void;
        componentDidUpdate?(prevProps: Readonly<any>, prevState: Readonly<FormState>, prevContext: any): void;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
    };
};
export declare const isRequired: ValidatorComposer;
export declare const email: ValidatorComposer;
export declare const minLength: ValidatorComposer;
export declare const maxLength: ValidatorComposer;
