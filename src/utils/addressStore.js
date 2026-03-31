/**
 * Simple module-level store to pass address data from AddressPickerScreen
 * back to CheckoutScreen without serialization issues (no callbacks in params).
 */

let _pendingAddress = null;

export const setPendingAddress = (address) => {
  _pendingAddress = address;
};

/** Returns and clears the pending address (consume-once pattern). */
export const consumePendingAddress = () => {
  const addr = _pendingAddress;
  _pendingAddress = null;
  return addr;
};
