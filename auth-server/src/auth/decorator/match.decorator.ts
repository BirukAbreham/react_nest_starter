import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

export function Match(property: string, validationOption?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOption,
            constraints: [property],
            validator: MatchConstraint,
        });
    };
}

@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
    validate(
        value: any,
        validationArguments?: ValidationArguments,
    ): boolean | Promise<boolean> {
        const [relatedPropertyName] = validationArguments.constraints;

        const relatedValue = (validationArguments.object as any)[
            relatedPropertyName
        ];

        return value === relatedValue;
    }
}
