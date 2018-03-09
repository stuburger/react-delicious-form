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
var hoistNonReactStatics = require('hoist-non-react-statics');
var validate_1 = require("./validate");
function unwrap(item, props, field, fields) {
    return typeof item === 'function' ? item(props, field, fields) : item;
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
    // logDevelopment('formHasFinishedLoadingWhen has not been supplied to the withForm higher order component but its value is not defined.')
    return true;
};
var defaultFormIsSubmitting = function () {
    logDevelopment('formIsSubmittingWhen function has not been supplied. Provide this function if you want your form to know when it is submitting correctly');
    return false;
};
var noErrors = [];
var noValidators = [];
var defaultFormValidation = { isValid: true, messages: [] };
var anEmptyObject = Object.freeze({});
function default_1(_a) {
    var _b = _a.formHasFinishedLoadingWhen, formHasFinishedLoadingWhen = _b === void 0 ? defaultFormHasFinishedLoading : _b, _c = _a.formIsSubmittingWhen, formIsSubmittingWhen = _c === void 0 ? defaultFormIsSubmitting : _c, _d = _a.fields, fieldDefinitions = _d === void 0 ? {} : _d, _e = _a.mapPropsToFields, mapPropsToFields = _e === void 0 ? function () { return anEmptyObject; } : _e, _f = _a.mapPropsToErrors, mapPropsToErrors = _f === void 0 ? function () { return anEmptyObject; } : _f, _g = _a.onSubmit, onSubmit = _g === void 0 ? function () { } : _g, _h = _a.resetFormWhen, resetFormWhen = _h === void 0 ? function () { return false; } : _h, _j = _a.options, options = _j === void 0 ? function () { return ({
        clearOnSubmit: true,
        validation: {
            preventSubmit: false
        }
    }); } : _j;
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
            return anEmptyObject;
        }
        return errors;
    };
    var mapToFields = function (props) {
        var value = mapPropsToFields(props);
        if (!lodash_1.isPlainObject(value)) {
            if (value !== undefined || value !== null)
                logDevelopment('mapPropsToFields must return an object but instead returned a ' + typeof value);
            return anEmptyObject;
        }
        return value;
    };
    var getInitialState = function (props) {
        var state = {
            submitCount: 0,
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
        var fieldValues = formIsReady ? mapToFields(props) : anEmptyObject;
        var trackedFields = lodash_1.transform(fieldDefinitions, function (ret, field, key) {
            var initialFieldState = getEmptyFieldState(field, key);
            if (formIsReady) {
                var initialValue = field.initialValue === undefined ? fieldValues[key] || '' : unwrap(field.initialValue, props) || '';
                initialFieldState.value = initialValue;
                initialFieldState.originalValue = lodash_1.cloneDeep(initialValue);
            }
            ret[key] = initialFieldState;
        });
        lodash_1.forOwn(fieldDefinitions, function (v, k, a) {
            if (v.computed && v.computed.read) {
                var readResult = v.computed.read(trackedFields, props);
                if (readResult !== trackedFields[k].value) {
                    trackedFields[k].value = readResult;
                }
            }
        });
        return trackedFields;
    };
    var getFormItem = function (fields, props) {
        return lodash_1.transform(fields, function (ret, field, key) {
            var computed = fieldDefinitions[key].computed;
            if (computed && computed.read) {
                ret[key] = computed.read(fields, props);
            }
            else {
                ret[key] = field.value;
            }
        });
    };
    var clearAllFields = function (fields) {
        return lodash_1.transform(fields, function (ret, val, field) {
            ret[field] = __assign({}, val, { touched: false, didBlur: false, value: '', originalValue: '' });
        });
    };
    var touchAllFields = function (fields) {
        return lodash_1.transform(fields, function (ret, val, field) {
            ret[field] = __assign({}, val, { touched: true, didBlur: true });
        });
    };
    var untouchAllFields = function (fields) {
        return lodash_1.transform(fields, function (ret, val, field) {
            ret[field] = __assign({}, val, { touched: false, didBlur: false, originalValue: val.value });
        });
    };
    var set = function (allFields, fieldName, value, props) {
        var fields = lodash_1.cloneDeep(allFields);
        var setValues = function (fName, val) {
            var computed = fieldDefinitions[fName].computed;
            if (computed && computed.write) {
                var writeResult_1 = computed.write(val, props);
                Object.keys(writeResult_1).forEach(function (key) { return setValues(key, writeResult_1[key]); });
            }
            if (computed && computed.read) {
                fields[fName].value = computed.read(fields, props);
            }
            else {
                fields[fName].value = val;
            }
            fields[fName].touched = true;
            lodash_1.forOwn(fieldDefinitions, function (v, k, a) {
                if (v.computed && v.computed.read) {
                    var readResult = v.computed.read(fields, props);
                    if (readResult !== fields[k].value) {
                        fields[k].value = readResult;
                        fields[k].touched = true;
                    }
                }
            });
        };
        setValues(fieldName, value);
        return fields;
    };
    return function (Child) {
        var Enhance = /** @class */ (function (_super) {
            __extends(Enhance, _super);
            function Enhance(props) {
                var _this = _super.call(this, props) || this;
                _this.updateField = function (fieldName, value) {
                    if (!_this.formLoaded)
                        return;
                    var computed = fieldDefinitions[fieldName].computed;
                    if (computed && computed.read && !computed.write)
                        return;
                    return _this.setState({
                        fields: set(_this.state.fields, fieldName, value, _this.props),
                        formStatus: FormStatus.TOUCHED
                    });
                };
                _this.bulkUpdateFields = function (partialUpdate) {
                    if (!_this.formLoaded)
                        return;
                    var fields = lodash_1.cloneDeep(_this.state.fields);
                    lodash_1.forOwn(partialUpdate, function (value, key) {
                        fields = set(fields, key, value, _this.props);
                    });
                    _this.setState(function (prevState) { return ({
                        fields: fields,
                        formStatus: FormStatus.TOUCHED
                    }); });
                };
                _this.submit = function (context) {
                    return new Promise(function (resolve, reject) {
                        if (!_this.formLoaded)
                            return reject(new Error('Form not yet loaded'));
                        var fields = touchAllFields(_this.state.fields);
                        _this.setState({ fields: fields, submitCount: _this.state.submitCount + 1 });
                        var opts = options(_this.props);
                        if (lodash_1.get(opts, 'validation.preventSubmit', false)) {
                            var formValidationResult = _this.getValidationForForm();
                            if (!formValidationResult.isValid)
                                return reject(_this.getKeyedValidationResult());
                        }
                        var value = getFormItem(fields, _this.props);
                        if (lodash_1.get(opts, 'clearOnSubmit', false))
                            _this.clearForm();
                        resolve(onSubmit(value, _this.props, context));
                    });
                };
                _this.onFieldChange = function (e) {
                    if (!_this.formLoaded)
                        return;
                    if (!lodash_1.get(e, 'currentTarget.name')) {
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
                _this.clearForm = function () {
                    _this.setState(function (prevState) { return ({
                        formStatus: FormStatus.CLEAN,
                        fields: clearAllFields(_this.state.fields)
                    }); });
                };
                _this.getValidationForField = function (definition, field) {
                    var validators = unwrap(definition.validators, _this.props) || noValidators;
                    return validators.reduce(function (ret, test) {
                        var result = test(field, _this.state.fields, _this.props);
                        ret.isValid = ret.isValid && result.isValid;
                        if (!result.isValid)
                            ret.messages.push(result.message);
                        return ret;
                    }, { isValid: true, messages: [] });
                };
                _this.getValidationForForm = function () {
                    return lodash_1.reduce(_this.state.fields, function (ret, field, fieldName) {
                        var result = _this.getValidationForField(fieldDefinitions[fieldName], field);
                        return {
                            isValid: ret.isValid && result.isValid,
                            messages: ret.messages.concat(result.messages)
                        };
                    }, { isValid: true, messages: [] });
                };
                _this.getKeyedValidationResult = function () {
                    return lodash_1.reduce(_this.state.fields, function (ret, field, fieldName) {
                        var result = _this.getValidationForField(fieldDefinitions[fieldName], field);
                        ret[fieldName] = ret[fieldName] || [];
                        ret[fieldName] = ret[fieldName].concat(result.messages);
                        return ret;
                    }, {});
                };
                _this.collectFormProps = function () {
                    var errors = noErrors;
                    var isDirty = false;
                    var validation = defaultFormValidation;
                    if (_this.formLoaded) {
                        errors = lodash_1.flatMap(lodash_1.values(mapToErrors(_this.props)), function (errors) { return errors; });
                        isDirty = lodash_1.some(_this.state.fields, function (f) { return !lodash_1.isEqual(f.originalValue, f.value); });
                        validation = _this.getValidationForForm();
                    }
                    return {
                        errors: errors,
                        isDirty: isDirty,
                        validation: validation,
                        status: _this.state.formStatus,
                        onSubmit: _this.submit,
                        clear: _this.clearForm,
                        updateField: _this.updateField,
                        submitCount: _this.state.submitCount,
                        hasSubmitted: _this.state.submitCount > 0,
                        bulkUpdateFields: _this.bulkUpdateFields,
                        value: getFormItem(_this.state.fields, _this.props)
                    };
                };
                _this.collectFieldProps = function () {
                    var errors = _this.formLoaded ? mapToErrors(_this.props) : {};
                    var fields = lodash_1.transform(_this.state.fields, function (ret, field, fieldName) {
                        ret[fieldName] = _this.getPropsForField(fieldName, errors);
                    });
                    return fields;
                };
                _this.getPropsForField = function (fieldName, errors) {
                    var field = _this.state.fields[fieldName];
                    var validationResult = _this.formLoaded
                        ? _this.getValidationForField(fieldDefinitions[fieldName], field)
                        : { isValid: true, messages: [] };
                    return {
                        state: __assign({}, field, validationResult, { isDirty: field.originalValue !== field.value }),
                        errors: errors[fieldName] || noErrors,
                        handlers: {
                            onChange: _this.onFieldChange,
                            onBlur: _this.onFieldBlur,
                            updateValue: function (value) { return _this.updateField(fieldName, value); }
                        },
                        props: unwrap(fieldDefinitions[fieldName].props, _this.props, field, _this.state.fields)
                    };
                };
                _this.state = getInitialState(props);
                _this.formLoaded = formHasLoaded(props);
                return _this;
            }
            Enhance.prototype.componentWillReceiveProps = function (nextProps, nextState) {
                var _this = this;
                if (resetFormWhen(this.props, nextProps)) {
                    this.clearForm();
                    this.formLoaded = false;
                }
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
            Enhance.prototype.render = function () {
                return React.createElement(Child, __assign({}, this.props, { form: this.collectFormProps(), fields: this.collectFieldProps() }));
            };
            return Enhance;
        }(React.Component));
        hoistNonReactStatics(Enhance, Child);
        return Enhance;
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