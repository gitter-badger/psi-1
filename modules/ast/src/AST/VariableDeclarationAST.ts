import {AST} from '.';
import { VariableAST, TypeAST} from '.';

export default class VariableDeclarationAST extends AST {
  public readonly type: TypeAST;

  constructor(public variable: VariableAST, type: TypeAST) {
    super();
    this.addChild(variable);
    this.type = type;
  }
}
