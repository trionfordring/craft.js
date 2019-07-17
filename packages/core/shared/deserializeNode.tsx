import React, { Children } from "react";
import { NodeData, SerializedNodeData, ReducedComp, ReduceCompType } from "../interfaces";
import { Canvas } from "../nodes";
import { Resolver } from "../interfaces/root";

const restoreType = (type: ReduceCompType, resolver: Resolver) => 
  typeof type === "object" && type.resolvedName ? 
    (
      type.resolvedName === 'Canvas' ? Canvas :
      resolver[type.resolvedName]
    ) : 
    typeof type === "string" ? 
      type : null;

export const deserializeComp = (data: ReducedComp, resolver: Resolver, index?: number): JSX.Element & {subtype?: React.ElementType | string} => {
  let { type, subtype, props } = data;
  const main = restoreType(type, resolver);
  if (!main) {
    return;
  }
  
  props = Object.keys(props).reduce((result: Record<string, any>, key) => {
    const prop = props[key];
    if (typeof prop === "object" && prop.resolvedName) {
      result[key] = deserializeComp(prop, resolver);
    }
    else result[key] = prop;
    return result;
  }, {});


  if (index) props.key = index;
  
  return {
    ...React.createElement(main, props),
    ...(subtype && { subtype: restoreType(subtype, resolver) }),
  }
}

export const deserializeNode = (data: SerializedNodeData, resolver: Resolver): Omit<NodeData, 'event'> => {
  let { type, subtype, props, ...nodeData } = data;

  const reducedComp = deserializeComp({ type, subtype, props }, resolver);

  return {
    ...reducedComp,
    ...nodeData
  };
}