import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({});

    const pokemonsToInsert: { name: string; nro: number }[] = [];

    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=150',
    );

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const nro = +segments[segments.length - 2];
      pokemonsToInsert.push({ name, nro });
    });

    await this.pokemonModel.insertMany(pokemonsToInsert);
    return data.results;
  }
}
