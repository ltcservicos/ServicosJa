import { IsArray, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsIn(['solicitante', 'prestador'])
  tipo: 'solicitante' | 'prestador';

  @IsString()
  nome: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(4)
  senha: string;

  @IsString()
  whatsapp: string;

  @IsString()
  cidade: string;

  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  rua?: string;

  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsString()
  complemento?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsArray()
  categorias?: string[];

  @IsOptional()
  @IsArray()
  bairros?: string[];

  @IsOptional()
  @IsString()
  foto?: string;
}

export class LoginDto {
  // WhatsApp (com ou sem formatação) ou e-mail
  @IsString()
  login: string;

  @IsString()
  senha: string;
}
