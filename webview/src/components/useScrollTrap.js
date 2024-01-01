import React from "react";

const CLOSE_TO_BOTTOM_DISTANCE = 100;
/*
  The `useScrollTrap` is a custom React Hook designed to create a scroll trap
  for a given element (`elementRef`). When activated, the scroll trap forces
  the element to auto-scroll to the bottom when scrolling is near the bottom.
  The scroll trap is automatically deactivated (ceases auto-scrolling)
  if the user tries to scroll up.

  - elementRef: A React ref object pointing to the target element.
  - triggers: Checks scroll position when a trigger changes. If at the
              bottom of the element, the scroll trap is active.
  - updaters: Checks to see if the scroll trap should be de-activated
              when the updaters change. The scroll trap de-activates
              if the user tries to scroll up.
*/
const useScrollTrap = (elementRef, triggers, updaters) => {
  // 'isTrapped' is a state variable representing the activation of the scroll trap
  const [isTrapped, setIsTrapped] = React.useState(false);
  /*
    A memoized function that calculates `isNearBottom`, indicating if
    the scroll position is near the bottom, and sets the 'isTrapped' state.
    This function triggers when any dependency in the 'triggers' array is updated.
  */
  React.useMemo(() => {
    const element = elementRef.current;
    if (!element) return;

    const isNearBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight <
      CLOSE_TO_BOTTOM_DISTANCE;
    setIsTrapped(isNearBottom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, triggers);

  /*
    A memoized function that calculates `hasScrolledUp`, a boolean representing
    whether the user has scrolled up. If `hasScrolledUp` is true, it sets
    'isTrapped' to its negation (deactivating the scroll trap).
    This function triggers when any dependency in the 'updaters' array is updated.
  */
  React.useMemo(() => {
    const element = elementRef.current;
    if (!element || !isTrapped) return;

    const hasScrolledUp =
      element.scrollHeight - element.scrollTop - element.clientHeight >
      CLOSE_TO_BOTTOM_DISTANCE;
    setIsTrapped(!hasScrolledUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, updaters);

  /*
    A side effect that triggers when any dependency in the 'updaters' array is updated.
    If 'isTrapped' is true, it invokes the scrollTo method on the target element with
    smooth scroll behavior to auto-scroll to the bottom of the element.
  */
  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (isTrapped) {
      const smoothScrollOptions = {
        top: element.scrollHeight,
        left: 0,
        behavior: "smooth",
      };
      element.scrollTo(smoothScrollOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, updaters);
};

export default useScrollTrap;
