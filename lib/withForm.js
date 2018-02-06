"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var lodash_1 = require("lodash");
var validate_1 = require("./validate");
function unwrap(item, props) {
    return typeof item === 'function' ? item(props) : item;
}
exports.unwrap = unwrap;
var validator = function (field, fields, props) {
    return {
        isValid: true
    };
};
var FormStatus;
(function (FormStatus) {
    FormStatus["CLEAN"] = "clean";
    FormStatus["TOUCHED"] = "touched";
    FormStatus["WORKING"] = "working";
    FormStatus["LOADING"] = "loading";
})(FormStatus = exports.FormStatus || (exports.FormStatus = {}));
function default_1(_a) {
    var _b = _a.formHasFinishedLoadingWhen, formHasFinishedLoadingWhen = _b === void 0 ? function () { return false; } : _b, _c = _a.formIsSubmittingWhen, formIsSubmittingWhen = _c === void 0 ? function () { return false; } : _c, _d = _a.fieldDefinitions, fieldDefinitions = _d === void 0 ? {} : _d, _e = _a.mapPropsToFields, mapPropsToFields = _e === void 0 ? function () { return ({}); } : _e, _f = _a.mapPropsToErrors, mapPropsToErrors = _f === void 0 ? function () { return ({}); } : _f, _g = _a.submit, submit = _g === void 0 ? function () { } : _g;
    var formHasLoaded = formHasFinishedLoadingWhen;
    var submitting = formIsSubmittingWhen;
    var getInitialState = function (props) {
        var state = { fields: {}, formStatus: FormStatus.LOADING };
        state.fields = createTrackedFormFields(props);
        if (!formHasLoaded(props))
            return state;
        state.formStatus = FormStatus.CLEAN;
        return state;
    };
    var createTrackedFormFields = function (props) {
        var fieldValues = formHasLoaded(props) ? mapPropsToFields(props) : {};
        return lodash_1.transform(fieldDefinitions, function (ret, field, key) {
            var initialValue = unwrap(field.initialValue, props) || fieldValues[key];
            ret[key] = {
                name: key,
                value: initialValue,
                originalValue: lodash_1.cloneDeep(initialValue),
                touched: false,
                didBlur: false
            };
        });
    };
    var getErrorsFromProps = function (props) {
        return formHasLoaded(props) ? mapPropsToErrors(props) : {};
    };
    var getFieldProps = function (props) {
        return lodash_1.transform(fieldDefinitions, function (ret, field, key) {
            ret[key] = unwrap(fieldDefinitions[key].props, props);
        });
    };
    var shouldValidateField = function (fieldDef, trackedField) { return ((fieldDef.validateAfter === 'blur' && trackedField.didBlur) ||
        (fieldDef.validateAfter === 'touched' && trackedField.touched)); };
    var getFormItem = function (fields) {
        return lodash_1.transform(fields, function (ret, field, key) {
            ret[key] = field.value;
        });
    };
    var touchAllFields = function (fields) { return (lodash_1.transform(fields, function (ret, val, field) {
        ret[field] = __assign({}, val, { touched: true, didBlur: true });
    })); };
    var untouchAllFields = function (fields) { return (lodash_1.transform(fields, function (ret, val, field) {
        ret[field] = __assign({}, val, { touched: false, didBlur: false, originalValue: val.value });
    })); };
    return function (Child) {
        return (function (_super) {
            __extends(Form, _super);
            function Form(props) {
                var _this = _super.call(this, props) || this;
                _this.updateField = function (fieldName, value, callback) {
                    var field = lodash_1.cloneDeep(_this.state.fields[fieldName]);
                    field.value = value;
                    field.touched = true;
                    var fields = lodash_1.cloneDeep(_this.state.fields);
                    fields[fieldName] = field;
                    _this.setState(function (prevState) { return ({ fields: fields, formStatus: FormStatus.TOUCHED }); }, callback);
                };
                _this.bulkUpdateFields = function (partialUpdate) {
                    var fields = lodash_1.transform(partialUpdate, function (ret, value, fieldName) {
                        ret[fieldName].value = value;
                        ret[fieldName].touched = true;
                    }, lodash_1.cloneDeep(_this.state.fields));
                    _this.setState(function (prevState) { return ({ fields: fields, formStatus: FormStatus.TOUCHED }); });
                };
                _this.submit = function (context) {
                    _this.setState(function (prevState) {
                        var fields = touchAllFields(prevState.fields);
                        submit(getFormItem(fields), _this.props, context);
                        return { fields: fields };
                    });
                };
                _this.onFieldChange = function (e) {
                    if (!lodash_1.get(e, 'target.name')) {
                        console.warn("The 'name' prop is not being passed to your input as is required to use the onChange handler on each field.\n            If you want to manually update this input use the 'updateField' function which can be accessed in your component via this.props.form.updateField.");
                    }
                    else if (!_this.state.fields[e.target.name]) {
                        console.warn("Field '" + e.target.name + "' does not exist on your form.\n            This could be due to the 'name' prop not being passed to your input.\n            If you want to manually update this input use the 'updateField' function which can be accessed in your component via this.props.form.updateField.");
                    }
                    else {
                        _this.updateField(e.target.name, e.target.value);
                    }
                };
                _this.getFieldValidationResult = function (definition, field) {
                    var validators = unwrap(definition.validators, _this.props);
                    return validators.reduce(function (ret, test) {
                        var result = test(field, _this.state.fields, _this.props);
                        ret.isValid = ret.isValid && result.isValid;
                        if (!result.isValid)
                            ret.messages.push(result.message);
                        return ret;
                    }, { isValid: true, messages: [] });
                };
                _this.createChildProps = function () {
                    var _a = _this.state, trackedFields = _a.fields, formStatus = _a.formStatus;
                    var errors = getErrorsFromProps(_this.props);
                    var form = {
                        isDirty: true,
                        formStatus: _this.state.formStatus,
                        submit: _this.submit,
                        updateField: _this.updateField,
                        bulkUpdateFields: _this.bulkUpdateFields,
                        currentValue: getFormItem(_this.state.fields),
                        validation: {
                            isValid: true,
                            messages: []
                        },
                        errors: lodash_1.flatMap(lodash_1.values(errors), function (errors) { return errors; })
                    };
                    var fields = {};
                    var _loop_1 = function (fieldName) {
                        var trackedField = trackedFields[fieldName];
                        var validationResult = _this.getFieldValidationResult(fieldDefinitions[fieldName], trackedField);
                        var isDirty = trackedField.originalValue !== trackedField.value;
                        fields[fieldName] = {
                            state: __assign({ isDirty: isDirty }, trackedField, validationResult),
                            errors: errors[fieldName],
                            handlers: {
                                onChange: _this.onFieldChange,
                                onFieldBlur: function () {
                                    _this.setState({
                                        fields: __assign({}, trackedFields, (_a = {}, _a[fieldName] = __assign({}, lodash_1.cloneDeep(trackedFields[fieldName]), { didBlur: true }), _a))
                                    });
                                    var _a;
                                }
                            },
                            props: unwrap(fieldDefinitions[fieldName].props, _this.props)
                        };
                        form.isDirty = isDirty || form.isDirty;
                        form.validation.isValid = validationResult.isValid && form.validation.isValid;
                        form.validation.messages = form.validation.messages.concat(validationResult.messages);
                    };
                    for (var fieldName in trackedFields) {
                        _loop_1(fieldName);
                    }
                    return { fields: fields, form: form };
                };
                _this.state = getInitialState(props);
                _this.formLoaded = _this.state.formStatus === FormStatus.CLEAN;
                return _this;
            }
            Form.prototype.componentWillReceiveProps = function (nextProps, nextState) {
                var _this = this;
                if (!this.formLoaded && formHasLoaded(nextProps)) {
                    this.formLoaded = true;
                    this.setState(getInitialState(nextProps));
                }
                if (!submitting(this.props) && submitting(nextProps)) {
                    return this.setState({ formStatus: FormStatus.WORKING });
                }
                if (submitting(this.props) && !submitting(nextProps)) {
                    return this.setState(function (prevState) { return ({
                        formStatus: FormStatus.CLEAN,
                        fields: untouchAllFields(_this.state.fields)
                    }); });
                }
            };
            Form.prototype.render = function () {
                var _a = this.state, fields = _a.fields, formStatus = _a.formStatus;
                return (React.createElement(Child, __assign({}, this.props, this.createChildProps())));
            };
            return Form;
        }(React.Component));
    };
}
exports.default = default_1;
exports.isRequired = function (message) { return function (field, fields, props) {
    var result = { message: null, isValid: true };
    if (!field.value || lodash_1.isNil(field.value)) {
        result.message = message || field.name + " is required";
    }
    result.isValid = !result.message;
    return result;
}; };
exports.email = function (message) { return function (field, fields) {
    var result = { message: null, isValid: true };
    if (!validate_1.isEmail(field.value))
        result.message = message || field.name + " must be a valid email address";
    result.isValid = !result.message;
    return result;
}; };
exports.minLength = function (length, message) { return function (field, fields, props) {
    var result = { message: null, isValid: true };
    if (field.value && field.value.length < length)
        result.message = message || field.name + " must be at least " + length + " characters";
    result.isValid = !result.message;
    return result;
}; };
exports.maxLength = function (length, message) { return function (field, fields, props) {
    var result = { message: null, isValid: true };
    var val = field.value || '';
    if (field.value && val.length > length)
        result.message = message || field.name + " must be at most " + length + " characters";
    result.isValid = !result.message;
    return result;
}; };
//# sourceMappingURL=withForm.js.map