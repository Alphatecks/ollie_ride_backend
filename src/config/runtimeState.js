const runtimeState = {
  isDatabaseReady: false,
  lastDatabaseError: null,
};

function setDatabaseReady(isReady, errorMessage = null) {
  runtimeState.isDatabaseReady = isReady;
  runtimeState.lastDatabaseError = errorMessage;
}

function getRuntimeState() {
  return { ...runtimeState };
}

module.exports = {
  setDatabaseReady,
  getRuntimeState,
};
