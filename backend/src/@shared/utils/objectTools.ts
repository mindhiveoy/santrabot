export enum ChangeType {
  ADD,
  MODIFY,
  DELETE,
}

export interface Change {
  type: ChangeType;
  key: string;
  oldValue?: any;
  newValue?: any;
}

export interface KeyValuePair {
  key: string;
  value?: any;
}

/**
 * Compares changes in objects properties between two objects.
 *
 * @param a Compare source object (start state)
 * @param b Compare target object (end state)
 */
export default function resolveChanges(a: object, b: object): Change[] {
  const changes: Change[] = [];

  const aKeys = a ? Object.keys(a) : [];
  const bKeys = b ? Object.keys(b) : [];

  if (a) {
    for (const key of aKeys) {
      const index = bKeys.findIndex(k => k === key);

      const oldValue = a[key];

      if (index >= 0) {
        const newValue = b[bKeys[index]];

        if (oldValue !== newValue) {
          changes.push({
            type: ChangeType.MODIFY,
            key,
            oldValue,
            newValue,
          });
        }
      } else {
        changes.push({
          type: ChangeType.DELETE,
          key,
          oldValue,
        });
      }
      bKeys.splice(index, 1);
    }
  }

  for (const key of bKeys) {
    changes.push({
      type: ChangeType.ADD,
      key,
      newValue: b[key],
    });
  }

  return changes;
}

export function mapInputToObject(array: KeyValuePair[]) {
  const result: any = {};

  if (array) {
    array.forEach(item => {
      if (item.key) {
        result[item.key] = item.value;
      }
    });
  }
  return result;
}

export function mapObjectToOutput(input: any): KeyValuePair[] {
  const result: KeyValuePair[] = [];
  const keys = Object.keys(input);

  keys.forEach(key => {
    result.push({
      key,
      value: input[key],
    });
  });
  return result;
}
