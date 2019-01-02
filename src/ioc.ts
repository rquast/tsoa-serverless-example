import { Container, inject, interfaces } from 'inversify';
import { autoProvide, fluentProvide } from 'inversify-binding-decorators';

const iocContainer = new Container();

const provideNamed = (
    identifier: string | symbol | interfaces.Newable<any> | interfaces.Abstract<any>,
    name: string
) => {
    return fluentProvide(identifier)
        .whenTargetNamed(name)
        .done();
};

const provideSingleton = (identifier: any) => {
    return fluentProvide(identifier)
        .inSingletonScope()
        .done();
};

export {iocContainer, autoProvide, provideSingleton, provideNamed, inject};
