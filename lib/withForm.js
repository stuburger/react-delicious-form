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
    var _b = _a.formHasLoaded, formHasLoaded = _b === void 0 ? function () { return false; } : _b, fieldDefinitions = _a.fieldDefinitions, _c = _a.mapPropsToFields, mapPropsToFields = _c === void 0 ? function () { return false; } : _c, _d = _a.submit, submit = _d === void 0 ? function () { } : _d;
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
            ret[key] = {
                name: key,
                value: fieldValues[key] || '',
                originalValue: fieldValues[key] || '',
                touched: false,
                didBlur: false
            };
        });
    };
    var getFieldProps = function (props) {
        return lodash_1.transform(fieldDefinitions, function (ret, field, key) {
            ret[key] = unwrap(field.props, props);
        });
    };
    var shouldValidateField = function (fieldDef, trackedField) { return ((fieldDef.validateAfter === 'blur' && trackedField.didBlur) ||
        (fieldDef.validateAfter === 'touched' && trackedField.touched)); };
    var getFormValidators = function (props) {
        return lodash_1.transform(fieldDefinitions, function (ret, field, key) {
            var validators = unwrap(field.validators, props);
            ret[key] = {
                validators: validators,
                validate: function (trackedField, allTrackedFields, currentProps, force) {
                    if (force === void 0) { force = false; }
                    if (force || shouldValidateField(field, trackedField)) {
                        return validators
                            .map(function (test) { return test(trackedField, allTrackedFields, currentProps); })
                            .filter(function (x) { return !!x; });
                    }
                    return [];
                }
            };
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
        return (function (_super) {
            __extends(Form, _super);
            function Form(props) {
                var _this = _super.call(this, props) || this;
                _this.updateField = function (fieldName, value, callback) {
                    if (_this.isFormDisabled())
                        return;
                    var field = lodash_1.cloneDeep(_this.state.fields[fieldName]);
                    field.value = value;
                    field.touched = true;
                    var fields = lodash_1.cloneDeep(_this.state.fields);
                    fields[fieldName] = field;
                    _this.setState(function (prevState) { return ({ fields: fields, formStatus: FormStatus.TOUCHED }); }, callback);
                };
                _this.submit = function () {
                    if (_this.isFormDisabled())
                        return;
                    _this.setState({
                        fields: touchAllFields(_this.state.fields)
                    }, function () {
                        submit(getFormItem(_this.state.fields), _this.props);
                    });
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
                    var form = {
                        isDirty: true,
                        formStatus: _this.state.formStatus,
                        submit: _this.submit,
                        updateField: _this.updateField,
                        currentValue: getFormItem(_this.state.fields),
                        validation: {
                            isValid: true,
                            errors: []
                        }
                    };
                    var fields = {};
                    var _loop_1 = function (fieldName) {
                        var trackedField = trackedFields[fieldName];
                        var validationResult = _this.getFieldValidationResult(fieldDefinitions[fieldName], trackedField);
                        var isDirty = trackedField.originalValue !== trackedField.value;
                        fields[fieldName] = {
                            state: __assign({ isDirty: isDirty }, trackedField, validationResult),
                            handlers: {
                                onChange: function (value) {
                                    _this.updateField(fieldName, value);
                                },
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
                        form.validation.errors = form.validation.errors.concat(validationResult.messages);
                    };
                    for (var fieldName in trackedFields) {
                        _loop_1(fieldName);
                    }
                    return {
                        fields: fields,
                        form: form
                    };
                };
                _this.state = getInitialState(props);
                _this.formLoaded = _this.state.formStatus === FormStatus.CLEAN;
                return _this;
            }
            Form.prototype.componentWillReceiveProps = function (nextProps, nextState) {
                var _this = this;
                if (!this.formLoaded && formHasLoaded(nextProps)) {
                    this.setState(getInitialState(nextProps));
                }
                if (!this.props.fetching && nextProps.fetching) {
                    return this.setState({ formStatus: FormStatus.LOADING });
                }
                if (!this.props.submitting && nextProps.submitting) {
                    return this.setState({ formStatus: FormStatus.WORKING });
                }
                if (this.props.submitting && !nextProps.submitting) {
                    return this.setState(function (prevState) { return ({
                        formStatus: FormStatus.CLEAN,
                        fields: untouchAllFields(_this.state.fields)
                    }); });
                }
            };
            Form.prototype.isFormDisabled = function () {
                return /loading|working/.test(this.state.formStatus);
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