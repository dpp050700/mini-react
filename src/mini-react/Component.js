import { findDOM, compareTwoVDom } from './react-dom'

export let updateQueue = {
  isBathingUpdate: false,
  updaters: new Set(),
  batchUpdate() {
    updateQueue.isBathingUpdate = false
    for (let updater of updateQueue.updaters) {
      updater.updateComponent()
    }
    updateQueue.updaters.clear()
  }
}

class Updater {
  constructor(classInstance) {
    this.classInstance = classInstance
    this.pendingStates = []
  }
  addState(partialState) {
    this.pendingStates.push(partialState)
    this.emitUpdate()
  }
  emitUpdate(nextProps) {
    this.nextProps = nextProps
    if (updateQueue.isBathingUpdate) {
      updateQueue.updaters.add(this)
    } else {
      this.updateComponent()
    }
  }
  updateComponent() {
    const { nextProps, classInstance, pendingStates } = this
    if (nextProps || pendingStates.length > 0) {
      shouldUpdate(classInstance, nextProps, this.getState())
    }
  }
  getState() {
    const { classInstance, pendingStates } = this
    let { state } = classInstance
    pendingStates.forEach((nextState) => {
      state = { ...state, ...nextState }
    })
    pendingStates.length = 0
    return state
  }
}

function shouldUpdate(classInstance, nextProps, nextState) {
  let willUpdate = true
  if (classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(nextProps, nextState)) {
    willUpdate = false
  }
  if (willUpdate && classInstance.componentWillUpdate) {
    classInstance.componentWillUpdate()
  }
  if (nextProps) {
    classInstance.props = nextProps
  }
  classInstance.state = nextState
  if (willUpdate) {
    classInstance.forceUpdate()
  }
}

export class Component {
  static isReactComponent = true
  constructor(props) {
    this.props = props
    this.state = null
    this.updater = new Updater(this)
  }

  setState(partialState) {
    this.updater.addState(partialState)
  }

  forceUpdate() {
    let oldRenderVDom = this.oldRenderVDom
    let oldDom = findDOM(oldRenderVDom)
    let newRenderVDom = this.render()
    compareTwoVDom(oldDom.parentNode, oldRenderVDom, newRenderVDom)
    this.oldRenderVDom = newRenderVDom

    if (this.componentDidUpdate) {
      this.componentDidUpdate(this.props, this.state)
    }
  }
}
