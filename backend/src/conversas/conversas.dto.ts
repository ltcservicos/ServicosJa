import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AbrirConversaDto {
  @IsString()
  servicoId: string;

  @IsString()
  trabalhadorId: string;
}

export class EnviarMensagemDto {
  @IsString()
  @MaxLength(1000)
  texto: string;
}

export class AvaliarDto {
  @IsInt()
  @Min(1)
  @Max(5)
  nota: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  comentario?: string;
}
