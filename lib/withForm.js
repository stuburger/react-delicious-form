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
var getEmptyFieldState = function (field, key, initialValue) {
    if (initialValue === void 0) { initialValue = ''; }
    var hasStaticInitialValue = field.initialValue !== undefined && typeof field.initialValue !== 'function';
    var value = hasStaticInitialValue ? field.initialValue : initialValue;
    return {
        name: key,
        value: value,
        originalValue: lodash_1.cloneDeep(value),
        touched: false,
        didBlur: false
    };
};
var FormStatus;
(function (FormStatus) {
    FormStatus["CLEAN"] = "clean";
    FormStatus["TOUCHED"] = "touched";
    FormStatus["SUBMITTING"] = "submitting";
    FormStatus["LOADING"] = "loading";
})(FormStatus = exports.FormStatus || (exports.FormStatus = {}));
var logDevelopment = function () {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
    }
    if (process.env.NODE_ENV === 'development') {
        console.log.apply(console, params);
    }
};
var defaultFormHasFinishedLoading = function () {
    logDevelopment('formHasFinishedLoadingWhen function is required to use the withForm higher order component but its value is not defined');
    return false;
};
var defaultFormIsSubmitting = function () {
    logDevelopment('formIsSubmittingWhen function has not been supplied. Provide this function if you want your form to know when it is submitting correctly');
    return false;
};
function default_1(_a) {
    var _b = _a.formHasFinishedLoadingWhen, formHasFinishedLoadingWhen = _b === void 0 ? defaultFormHasFinishedLoading : _b, _c = _a.formIsSubmittingWhen, formIsSubmittingWhen = _c === void 0 ? defaultFormIsSubmitting : _c, _d = _a.fieldDefinitions, fieldDefinitions = _d === void 0 ? {} : _d, _e = _a.mapPropsToFields, mapPropsToFields = _e === void 0 ? function () { return ({}); } : _e, _f = _a.mapPropsToErrors, mapPropsToErrors = _f === void 0 ? function () { return ({}); } : _f, _g = _a.onSubmit, onSubmit = _g === void 0 ? function () { } : _g;
    var submitting = formIsSubmittingWhen;
    var formHasLoaded = function (props) {
        var res = formHasFinishedLoadingWhen(props);
        if (typeof res !== 'boolean') {
            logDevelopment('formHasFinishedLoadingWhen must return a boolean value but instead returned a ' + typeof res);
            return !!res;
        }
        return res;
    };
    var mapToErrors = function (props) {
        var errors = mapPropsToErrors(props);
        if (!lodash_1.isPlainObject(errors)) {
            logDevelopment('mapPropsToErrors must return an object but instead returned a ' + typeof errors);
            return {};
        }
        return errors;
    };
    var mapToFields = function (props) {
        var value = mapPropsToFields(props);
        if (!lodash_1.isPlainObject(value)) {
            logDevelopment('mapPropsToFields must return an object but instead returned a ' + typeof value);
            return {};
        }
        return value;
    };
    var getInitialState = function (props) {
        var state = {
            fields: {},
            formStatus: FormStatus.LOADING
        };
        state.fields = createTrackedFormFields(props);
        if (!formHasLoaded(props))
            return state;
        state.formStatus = FormStatus.CLEAN;
        return state;
    };
    var createTrackedFormFields = function (props) {
        var formIsReady = formHasLoaded(props);
        var fieldValues = formIsReady ? mapToFields(props) : {};
        return lodash_1.transform(fieldDefinitions, function (ret, field, key) {
            var initialFieldState = getEmptyFieldState(field, key);
            if (formIsReady) {
                var initialValue = field.initialValue === undefined ?
                    fieldValues[key] || '' :
                    unwrap(field.initialValue, props) || '';
                initialFieldState.value = initialValue;
                initialFieldState.originalValue = lodash_1.cloneDeep(initialValue);
            }
            ret[key] = initialFieldState;
        });
    };
    var getErrorsFromProps = function (props) {
        return formHasLoaded(props) ? mapToErrors(props) : {};
    };
    var getFieldProps = function (props) {
        return lodash_1.transform(fieldDefinitions, function (ret, field, key) {
            ret[key] = unwrap(fieldDefinitions[key].props, props);
        });
    };
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
        return /** @class */ (function (_super) {
            __extends(Form, _super);
            function Form(props) {
                var _this = _super.call(this, props) || this;
                _this.updateField = function (fieldName, value, callback) {
                    if (!_this.formLoaded)
                        return;
                    var field = lodash_1.cloneDeep(_this.state.fields[fieldName]);
                    field.value = value;
                    field.touched = true;
                    var fields = lodash_1.cloneDeep(_this.state.fields);
                    fields[fieldName] = field;
                    _this.setState(function (prevState) { return ({ fields: fields, formStatus: FormStatus.TOUCHED }); }, callback);
                };
                _this.bulkUpdateFields = function (partialUpdate) {
                    if (!_this.formLoaded)
                        return;
                    var fields = lodash_1.transform(partialUpdate, function (ret, value, fieldName) {
                        ret[fieldName].value = value;
                        ret[fieldName].touched = true;
                    }, lodash_1.cloneDeep(_this.state.fields));
                    _this.setState(function (prevState) { return ({ fields: fields, formStatus: FormStatus.TOUCHED }); });
                };
                _this.submit = function (context) {
                    if (!_this.formLoaded)
                        return;
                    _this.setState(function (prevState) {
                        var fields = touchAllFields(prevState.fields);
                        onSubmit(getFormItem(fields), _this.props, context);
                        return { fields: fields };
                    });
                };
                _this.onFieldChange = function (e) {
                    if (!_this.formLoaded)
                        return;
                    if (!lodash_1.get(e, 'target.name')) {
                        return logDevelopment("The 'name' prop is not being passed to your input as is required to use the onChange handler on each field.\n            If you want to manually update this input use the 'updateField' function which can be accessed in your component via this.props.form.updateField.");
                    }
                    if (!_this.state.fields[e.currentTarget.name]) {
                        return logDevelopment("Field '" + e.currentTarget.name + "' does not exist on your form.\n            This could be due to the 'name' prop not being passed to your input.\n            If you want to manually update this input use the 'updateField' function which can be accessed in your component via this.props.form.updateField.");
                    }
                    _this.updateField(e.currentTarget.name, e.currentTarget.value);
                };
                _this.onFieldBlur = function (e) {
                    if (!_this.formLoaded)
                        return;
                    if (!lodash_1.get(e, 'currentTarget.name')) {
                        return logDevelopment("The 'name' prop is not being passed to your input as is required to use the onChange handler on each field.\n            Did blur cannot be updated.");
                    }
                    if (!_this.state.fields[e.currentTarget.name]) {
                        return logDevelopment("Field '" + e.currentTarget.name + "' does not exist on your form.\n            This could be due to the 'name' prop not being passed to your input. Did blur cannot be updated.");
                    }
                    if (_this.state.fields[e.currentTarget.name].didBlur) {
                        return;
                    }
                    _this.setState({
                        fields: __assign({}, _this.state.fields, (_a = {}, _a[e.currentTarget.name] = __assign({}, _this.state.fields[e.currentTarget.name], { didBlur: true }), _a))
                    });
                    var _a;
                };
                _this.getValidationForField = function (definition, field) {
                    var validators = unwrap(definition.validators, _this.props) || [];
                    return validators.reduce(function (ret, test) {
                        var result = test(field, _this.state.fields, _this.props);
                        ret.isValid = ret.isValid && result.isValid;
                        if (!result.isValid)
                            ret.messages.push(result.message);
                        return ret;
                    }, { isValid: true, messages: [] });
                };
                _this.collectFormProps = function () {
                    var errors = [];
                    var isDirty = false;
                    var validation = { isValid: true, messages: [] };
                    if (_this.formLoaded) {
                        errors = lodash_1.flatMap(lodash_1.values(getErrorsFromProps(_this.props)), function (errors) { return errors; });
                        isDirty = lodash_1.some(_this.state.fields, function (f) { return f.originalValue !== f.value; });
                        validation = lodash_1.reduce(_this.state.fields, function (ret, field, fieldName) {
                            var result = _this.getValidationForField(fieldDefinitions[fieldName], field);
                            return {
                                isValid: ret.isValid && result.isValid,
                                messages: ret.messages.concat(result.messages)
                            };
                        }, validation);
                    }
                    return {
                        errors: errors,
                        isDirty: isDirty,
                        validation: validation,
                        status: _this.state.formStatus,
                        onSubmit: _this.submit,
                        updateField: _this.updateField,
                        bulkUpdateFields: _this.bulkUpdateFields,
                        value: getFormItem(_this.state.fields),
                    };
                };
                _this.collectFieldProps = function () {
                    var errors = getErrorsFromProps(_this.props);
                    var fields = lodash_1.transform(_this.state.fields, function (ret, field, fieldName) {
                        ret[fieldName] = _this.getPropsForField(fieldName, errors);
                    });
                    return fields;
                };
                _this.getPropsForField = function (fieldName, errors) {
                    var field = _this.state.fields[fieldName];
                    var validationResult = _this.formLoaded ?
                        _this.getValidationForField(fieldDefinitions[fieldName], field) :
                        { isValid: true, messages: [] };
                    return {
                        state: __assign({}, field, validationResult, { isDirty: field.originalValue !== field.value }),
                        errors: errors[fieldName],
                        handlers: {
                            onChange: _this.onFieldChange,
                            onBlur: _this.onFieldBlur
                        },
                        props: unwrap(fieldDefinitions[fieldName].props, _this.props)
                    };
                };
                _this.state = getInitialState(props);
                _this.formLoaded = formHasLoaded(props);
                return _this;
            }
            Form.prototype.componentWillReceiveProps = function (nextProps, nextState) {
                var _this = this;
                if (!this.formLoaded && formHasLoaded(nextProps)) {
                    this.formLoaded = true;
                    this.setState(getInitialState(nextProps));
                }
                if (!submitting(this.props) && submitting(nextProps)) {
                    return this.setState({ formStatus: FormStatus.SUBMITTING });
                }
                if (submitting(this.props) && !submitting(nextProps)) {
                    return this.setState(function (prevState) { return ({
                        formStatus: FormStatus.CLEAN,
                        fields: untouchAllFields(_this.state.fields)
                    }); });
                }
            };
            Form.prototype.render = function () {
                return (React.createElement(Child, __assign({}, this.props, { form: this.collectFormProps(), fields: this.collectFieldProps() })));
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