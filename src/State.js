import { observe } from 'mobx';

import _get from 'lodash/get';
import _pick from 'lodash/pick';
import _isString from 'lodash/isString';

import Options from './Options';
import Bindings from './Bindings';

import {
  props,
  isStruct,
  checkObserve,
  hasUnifiedProps,
  hasSeparatedProps } from './utils';

export default class State {

  strict = false;

  form;

  mode;

  options;

  bindings;

  $extra;

  disposers = {
    interceptor: {},
    observer: {},
  };

  $struct = [];

  initial = {
    props: {},
    fields: {},
  };

  current = {
    props: {},
    fields: {},
  };

  constructor({ form, initial, options, bindings }) {
    this.set('form', form);
    this.initProps(initial);
    this.initOptions(options);
    this.initBindings(bindings);
    this.observeOptions();
  }

  initOptions(options) {
    this.options = new Options();
    this.options.set(options);
  }

  initProps(initial) {
    const initialProps = _pick(initial, [
      ...props.separated,
      ...props.validation,
      ...props.function,
      ...props.hooks,
    ]);

    this.set('initial', 'props', initialProps);

    const $isStruct = isStruct(initial);
    const $unified = hasUnifiedProps(initial);
    const $separated = hasSeparatedProps(initial);

    if ($unified && $separated) {
      console.warn( // eslint-disable-line
        'WARNING: Your mobx-react-form instance ', this.form.name,
        ' is running in MIXED Mode (Unified + Separated) as fields properties definition.',
        'This mode is experimental, use it at your own risk, or use only one mode.',
      );
    }

    if (($separated || $isStruct) && !$unified) {
      this.strict = true;
      this.mode = 'separated';
      this.struct(initial.fields);
      return;
    }

    this.mode = 'unified';
  }

  initBindings(bindings) {
    this.bindings = new Bindings();
    this.bindings.register(bindings);
  }

  /**
    Get/Set Fields Structure
  */
  struct(data = null) {
    if (data) this.$struct = data;
    return this.$struct;
  }

  /**
    Get Props/Fields
  */
  get(type, subtype) {
    return this[type][subtype];
  }

  /**
    Set Props/Fields
  */
  set(type, subtype, state = null) {
    if (type === 'form') {
      // subtype is the form here
      this.form = subtype;
    }

    if (type === 'initial') {
      Object.assign(this.initial[subtype], state);
      Object.assign(this.current[subtype], state);
    }

    if (type === 'current') {
      Object.assign(this.current[subtype], state);
    }
  }

  extra(data = null) {
    if (_isString(data)) return _get(this.$extra, data);
    if (data === null) return this.$extra;
    this.$extra = data;
    return null;
  }

  observeOptions() {
    // Fix Issue #201
    observe(this.options.options, checkObserve([{
      // start observing fields validateOnChange
      type: 'update',
      key: 'validateOnChange',
      to: true,
      exec: () => this.form.each(field => field.observeValidation('onChange')),
    }, {
      // stop observing fields validateOnChange
      type: 'update',
      key: 'validateOnChange',
      to: false,
      exec: () => this.form.each(field => field.disposeValidationOnChange()),
    }, {
      // start observing fields validateOnBlur
      type: 'update',
      key: 'validateOnBlur',
      to: true,
      exec: () => this.form.each(field => field.observeValidation('onBlur')),
    }, {
      // stop observing fields validateOnBlur
      type: 'update',
      key: 'validateOnBlur',
      to: false,
      exec: () => this.form.each(field => field.disposeValidationOnBlur()),
    }]));
  }
}
