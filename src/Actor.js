import EventEmitter from './EventEmitter';

const eventEmitter = new EventEmitter();

let actoraddresses = {}


function getAddress (target) {
    let address = target
    if (typeof target === 'string') {
        address = actoraddresses[target]
    }
    return address
}

const Actor = {
    start (behavior) {
        const address = Symbol();
        let state = typeof behavior.init === "function" ? behavior.init() : {};

        eventEmitter.on(address, function([method, message]) {
            state = behavior[method](state, message) || state;
        });

        actoraddresses[behavior.name] = address;

        return address;
    },

    send (target, message) {
        eventEmitter.emit(getAddress(target), message);
    },

    end (target) {
        eventEmitter.off(getAddress(target));
    }
};

export default Actor;
