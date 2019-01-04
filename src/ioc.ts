import { Container, inject } from 'inversify';
import { autoProvide, fluentProvide } from 'inversify-binding-decorators';

const iocContainer = new Container();

const provideSingleton = (identifier: any) => {
    return fluentProvide(identifier)
        .inSingletonScope()
        .done();
};

export { iocContainer, autoProvide, provideSingleton, inject };
