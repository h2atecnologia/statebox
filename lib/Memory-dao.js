const process = require('process')
const boom = require('boom')
const _ = require('lodash')

class MemoryDao {
  constructor (options) {
    this.uuid = 0
    this.executions = {}
  }

  createNewExecution (startAt, input, flowName, executionOptions, callback) {
    this.uuid++
    const executionName = this.uuid.toString()
    const executionDescription = {
      executionName: executionName,
      ctx: input,
      currentStateName: startAt,
      flowName: flowName,
      status: 'RUNNING',
      parentExecutionName: executionOptions.parentExecutionName,
      rootExecutionName: executionOptions.rootExecutionName,
      startDate: new Date().toISOString()
    }
    this.executions[executionName] = executionDescription
    process.nextTick(
      function () {
        callback(null, executionDescription)
      }
    )
  }

  findExecutionByName (executionName, callback) {
    const _this = this
    process.nextTick(
      function () {
        const raw = _this.executions[executionName]
        if (raw) {
          callback(
            null,
            raw
          )
        } else {
          callback(null, null)
        }
      }
    )
  }

  succeedExecution (executionName, ctx, callback) {
    const _this = this
    process.nextTick(
      function () {
        const execution = _this.executions[executionName]
        if (execution) {
          execution.ctx = ctx
          execution.status = 'SUCCEEDED'
          callback(null)
        } else {
          // TODO: Something bad happened
          callback(boom.badRequest(`Unable to succeed execution with name '${executionName}'`))
        }
      }
    )
  }

  failExecution (executionName, errorMessage, errorCode, callback) {
    const _this = this
    process.nextTick(
      function () {
        const execution = _this.executions[executionName]
        if (execution) {
          execution.status = 'FAILED'
          execution.errorCode = errorCode
          execution.errorMessage = errorMessage
          callback(null)
        } else {
          // TODO: Something bad happened
          callback(boom.badRequest(`Unable to succeed execution with name '${executionName}'`))
        }
      }
    )
  }

  setNextState (executionName, nextStateName, ctx, callback) {
    const _this = this
    process.nextTick(
      function () {
        const execution = _this.executions[executionName]
        if (execution) {
          execution.ctx = ctx
          execution.currentStateName = nextStateName
          callback(null)
        } else {
          // TODO: Something bad happened
          callback(boom.badRequest(`Unable to set next state name for execution with name '${executionName}'`))
        }
      }
    )
  }

  updateCurrentStateName (stateName, executionName, callback) {
    const _this = this
    process.nextTick(
      function () {
        const execution = _this.executions[executionName]
        if (execution) {
          execution.currentStateName = stateName
          callback(null)
        } else {
          // TODO: Something bad happened
          callback(boom.badRequest(`Unable to update state name for execution with name '${executionName}'`))
        }
      }
    )
  }

  getBranchSummary (parentExecutionName, callback) {
    const _this = this
    process.nextTick(
      function () {
        const summary = {
          numberOfBranches: 0,
          numberSucceeded: 0,
          numberFailed: 0
        }
        _.forOwn(
          _this.executions,
          function (execution) {
            if (execution.hasOwnProperty('parentExecutionName') && execution.parentExecutionName === parentExecutionName) {
              summary.numberOfBranches++
              switch (execution.status) {
                case 'SUCCEEDED':
                  summary.numberSucceeded++
                  break

                case 'FAILED':
                  summary.numberFailed++
                  break
              }
            }
          }
        )
        callback(null, summary)
      }
    )
  }

  markRelatedBranchesAsFailed (executionName, defaultErrorCause, defaultErrorCode, callback) {
    const _this = this
    process.nextTick(
      function () {
        const execution = _this.executions[executionName]
        if (execution) {
          execution.status = 'FAILED'
          if (!execution.errorCause) {
            execution.errorCause = defaultErrorCause
          }
          if (!execution.errorCode) {
            execution.errorCode = defaultErrorCode
          }
          callback(null)
        } else {
          // TODO: Something bad happened
          callback(boom.badRequest(`Unable to set next state name for execution with name '${executionName}'`))
        }
      }
    )
  }
}

module.exports = MemoryDao