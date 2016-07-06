'use strict';

function TurboCartoError (message, originalErr, context) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;

  if (originalErr) {
    message += ' ' + originalErr.message;
  }

  this.message = message;
  this.originalErr = originalErr;
  this.context = context;
}

require('util').inherits(TurboCartoError, Error);

module.exports = TurboCartoError;
