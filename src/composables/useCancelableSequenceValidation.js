import { onBeforeUnmount, ref } from "vue";

export function useCancelableSequenceValidation(validate) {
  const result = ref(null);
  const error = ref(null);
  const validating = ref(false);
  let controller = null;
  let requestId = 0;

  async function run(sequence, policy = {}) {
    controller?.abort();
    controller = new AbortController();
    const currentController = controller;
    const currentRequestId = ++requestId;
    validating.value = true;
    error.value = null;
    try {
      const next = await validate(sequence, policy, {
        signal: currentController.signal,
      });
      if (currentRequestId !== requestId || currentController.signal.aborted) {
        return null;
      }
      result.value = next;
      return next;
    } catch (reason) {
      if (
        currentRequestId !== requestId ||
        currentController.signal.aborted ||
        reason?.name === "AbortError"
      ) {
        return null;
      }
      error.value = { code: "sequence.validationUnavailable" };
      return null;
    } finally {
      if (currentRequestId === requestId) validating.value = false;
    }
  }

  function cancel() {
    requestId += 1;
    controller?.abort();
    controller = null;
    validating.value = false;
  }

  onBeforeUnmount(cancel);

  return { cancel, error, result, run, validating };
}
