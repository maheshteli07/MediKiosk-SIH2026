/**
 * ConsultationModeCard.jsx – Patient Module
 *
 * A selectable card displaying one consultation mode option.
 * Shows icon, title, and description. Highlights when selected.
 *
 * Developer 1 owns this file.
 */

import React from "react";

function ConsultationModeCard({ mode, isSelected, onSelect }) {
  // TODO: Implement consultation mode card UI
  return (
    <div onClick={() => onSelect(mode.id)}>
      {/* Implement: icon, title, description, selected state styling */}
    </div>
  );
}

export default ConsultationModeCard;
