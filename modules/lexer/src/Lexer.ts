import * as Token from './token';
import CaseInsensitiveMap from 'case-insensitive-map';
import * as Types from 'data-types';
import { parse } from 'path';

export class Lexer {
  protected readonly reservedKeywords = new CaseInsensitiveMap<string, () => Token.IToken>([
    ['PROGRAM', () => new Token.ProgramToken()],
    ['VAR', () => new Token.VariableToken()],
    ['BEGIN', () => new Token.BeginToken()],
    ['END', () => new Token.EndToken()],
    ['DIV', () => new Token.IntegerDivisionToken()],
    ['INTEGER', () => new Token.IntegerToken()],
    ['REAL', () => new Token.RealToken()],
    ['PROCEDURE', () => new Token.ProcedureToken()]
  ]);

  private readonly numberRegex = /^\d$/;
  private readonly idFistCharacterRegex = /^[a-zA-Z_]$/;
  private readonly idRegex = /^[a-zA-Z0-9_]$/;
  private readonly whitespaceRegex = /^\s$/;

  private sourceCode: string;
  private position: number;
  private currentCharacter: string|null;

  constructor(sourceCode: string) {
    if(!sourceCode.length) {
      throw new Error('Empty source code');
    }

    this.sourceCode = sourceCode;
    this.position = 0;
    this.currentCharacter = this.sourceCode[this.position];
  }

  private peek(length: number = 1) {
    const peekPosition = this.position + length;

    if(peekPosition >= this.sourceCode.length) {
      return null;
    } else {
      return this.sourceCode.substring(this.position + 1, peekPosition + 1);
    }
  }

  private advance(length: number = 1) {
    this.position += length;

    if(this.position >= this.sourceCode.length) {
      return null;
    } else {
      return this.sourceCode[this.position];
    }
  }

  private whitespace() {
    while(this.currentCharacter !== null && this.currentCharacter.match(this.whitespaceRegex)) {
      this.currentCharacter = this.currentCharacter = this.advance();
    }
  }

  private comment() {
    while(this.currentCharacter !== '}') {
      this.currentCharacter = this.advance();
    }
    this.currentCharacter = this.advance();
  }

  private number() {
    let number = '';
    while(this.currentCharacter !== null && this.currentCharacter.match(this.numberRegex)) {
      number += this.currentCharacter;
      this.currentCharacter = this.advance();
    }

    if(this.currentCharacter == '.') {
      number += this.currentCharacter;
      this.currentCharacter = this.advance();
      while(this.currentCharacter !== null && this.currentCharacter.match(this.numberRegex)) {
        number += this.currentCharacter;
        this.currentCharacter = this.advance();
      }

      return new Token.RealConstToken(new Types.Real(parseFloat(number)));
    } else {
      return new Token.IntegerConstToken(new Types.Integer(parseInt(number)));
    }
  }

  private id() {
    let id = '';
    while(this.currentCharacter !== null && this.currentCharacter.match(this.idRegex)) {
      id += this.currentCharacter;
      this.currentCharacter = this.advance();
    }
    if(this.reservedKeywords.has(id)) {
      return (this.reservedKeywords.get(id) as () => Token.IToken)();
    } else {
      return new Token.IdToken(id);
    }
  }

  public getNextToken() {
    while(this.currentCharacter != null) {
      if(this.currentCharacter.match(this.whitespaceRegex)) {
        this.whitespace();
        continue;
      } else if(this.currentCharacter == '{') {
        this.comment();
        continue;
      } else if(this.currentCharacter == ':' && this.peek() == '=') {
        this.currentCharacter = this.advance(2);
        return new Token.AssignToken();
      } else if(this.currentCharacter == ';') {
        this.currentCharacter = this.advance();
        return new Token.SemiToken();
      } else if(this.currentCharacter == '+') {
        this.currentCharacter = this.advance();
        return new Token.PlusToken();
      } else if(this.currentCharacter == '-') {
        this.currentCharacter = this.advance();
        return new Token.MinusToken();
      } else if(this.currentCharacter == '*') {
        this.currentCharacter = this.advance();
        return new Token.MultiplicationToken();
      } else if(this.currentCharacter == '/') {
        this.currentCharacter = this.advance();
        return new Token.RealDivisionToken();
      } else if(this.currentCharacter == '(') {
        this.currentCharacter = this.advance();
        return new Token.OpeningParenthesisToken();
      } else if(this.currentCharacter == ')') {
        this.currentCharacter = this.advance();
        return new Token.ClosingParenthesisToken();
      } else if(this.currentCharacter == '.') {
        this.currentCharacter = this.advance();
        return new Token.DotToken();
      } else if(this.currentCharacter == ':') {
        this.currentCharacter = this.advance();
        return new Token.ColonToken();
      } else if(this.currentCharacter == ',') {
        this.currentCharacter = this.advance();
        return new Token.CommaToken();
      } else if(this.currentCharacter.match(this.numberRegex)) {
        return this.number();
      } else if(this.currentCharacter.match(this.idFistCharacterRegex)) {
        return this.id();
      } else {
        throw new Error(`Undefined token '${this.currentCharacter}'`);
      }
    }

    return new Token.EofToken();
  }
}

export * from './token';