import { FormControl, ValidationErrors } from '@angular/forms';

export const requiredNotEmpty = (
  control: FormControl,
): ValidationErrors | null => {
  if (!control.value || control.value.trim() === '') {
    return { requiredNotEmpty: true };
  }
  return null;
};