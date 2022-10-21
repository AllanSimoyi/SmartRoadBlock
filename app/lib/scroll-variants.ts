import type { Variants } from "framer-motion";

export const animateOnShowVariants: Variants = {
  open: {
    opacity: 1,
    scale: 1,
    transition: {
      delay: 0.5,
      type: "tween",
    },
  },
  closed: {
    opacity: 0,
    scale: 0,
    transition: {
      delay: 0.5,
      type: "tween",
    },
  },
}

interface Props {
  delay?: number,
  duration?: number,
}

export function getSlideUpScrollVariants (props: Props) {
  const { delay = 0, duration = 0.25 } = props;
  const variants: Variants = {
    offscreen: {
      y: 25,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        delay: delay,
        type: "tween", // spring
        duration,
      }
    }
  };
  return variants;
}

export function getSlideDownScrollVariants (props: Props) {
  const { delay = 0, duration = 0.25 } = props;
  const variants: Variants = {
    offscreen: {
      y: -25,
      opacity: 0,
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        delay: delay,
        type: "tween", // spring
        duration,
      }
    }
  };
  return variants;
}

export function getSlideRightScrollVariants (props: Props) {
  const { delay = 0, duration = 0.25 } = props;
  const variants: Variants = {
    offscreen: {
      x: -25,
      opacity: 0,
    },
    onscreen: {
      x: 0,
      opacity: 1,
      transition: {
        delay,
        type: "tween",
        duration
      }
    }
  };
  return variants;
}