import { observable, action, toJS, extendObservable } from 'mobx';
import _has from 'lodash/has';

export default class Options {

  @observable options = {
    defaultGenericError: null,
    alwaysShowDefaultError: false,
    submitThrowsError: true,
    showErrorsOnInit: false,
    showErrorsOnSubmit: true,
    showErrorsOnBlur: true,
    showErrorsOnChange: true,
    showErrorsOnClear: false,
    showErrorsOnReset: true,
    validateOnInit: true,
    validateOnBlur: true,
    validateOnChange: false,
    strictUpdate: false,
    strictDelete: true,
    retrieveOnlyDirtyValues: false,
    retrieveOnlyEnabledFields: false,
    autoParseNumbers: false,
    allowRequired: false,
    validationDebounceWait: 250,
    validationDebounceOptions: {
      leading: false,
      trailing: true,
    },
  };

  get(key = null, field = null) {
    // handle field option
    if (_has(field, 'path')) {
      if (_has(field.$options, key)) {
        return field.$options[key];
      }
    }

    // fallback on global form options
    if (key) return this.options[key];
    return toJS(this.options);
  }

  @action
  set(options) {
    extendObservable(this.options, options);
  }
}
