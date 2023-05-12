import React from 'react';
interface TransitionGroupWrapperProps {
    enableLegacyTransitions: boolean;
    component: string;
    className: string;
    transform: string;
    children: React.ReactNode;
}
declare const TransitionGroupWrapper: (props: TransitionGroupWrapperProps) => JSX.Element;
export default TransitionGroupWrapper;
