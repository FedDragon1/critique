import mitt from "mitt";

const emitter = mitt<CritiqueEvents>()

export default function useEventBus() {
    return emitter
}
