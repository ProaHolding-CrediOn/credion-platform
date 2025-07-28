"use client";

import { ConditionalFormBlock, EnhancedBlock, FormBlock, MultiFormSelectorFormBlock, PayoutDistributionFormBlock, RepeatableFormBlock } from "@/types/FormField";
import { BlockRendererProps } from "./BlockRenderer.type";
import FormBlockRenderer from "./FormBlockRenderer";
import ConditionalFormBlockRenderer from "./ConditionalBlockRenderer";
import PayoutDistributionFormBlockRenderer from "./PayoutDistributionBlockRenderer";
import MultiFormSelectorFormBlockRenderer from "./MultiFormSelectorFormBlockRenderer";

export const isRepeatableFormBlock = (field: EnhancedBlock): field is RepeatableFormBlock => {
  return "blockType" in field && field.blockType === "repeatableFormBlock";
}

export const isMultiFormSelectorFormBlock = (field: EnhancedBlock): field is MultiFormSelectorFormBlock => {
  return "blockType" in field && field.blockType === "multiFormSelectorBlock";
}

export const isPayoutDistributionFormBlock = (field: EnhancedBlock): field is PayoutDistributionFormBlock => {
  return "blockType" in field && field.blockType === "payoutDistributionBlock";
}

export const isConditionalFormBlock = (field: EnhancedBlock): field is ConditionalFormBlock => {
  return "blockType" in field && field.blockType === "conditionalFormBlock";
}

export const isRegularFormBlock = (field: EnhancedBlock): field is FormBlock => {
  return "blockType" in field && field.blockType === "formBlock";
}

export default function BlockRenderer({
  block,
  blockKey,
  store
}: BlockRendererProps) {

  if (isRegularFormBlock(block)) {
    return <FormBlockRenderer block={block} blockKey={blockKey} store={store} />;
  }

  if (isConditionalFormBlock(block)) {
    console.log('block', block)
    return <ConditionalFormBlockRenderer block={block} blockKey={blockKey} store={store} />
  }

  if (isPayoutDistributionFormBlock(block)) {
    return <PayoutDistributionFormBlockRenderer block={block} blockKey={blockKey} store={store} />
  }

  if (isMultiFormSelectorFormBlock(block)) {
    return <MultiFormSelectorFormBlockRenderer block={block} blockKey={blockKey} store={store} />
  }

  return null;
}