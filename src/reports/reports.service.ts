import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from '../users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  // createEstimate(estimateDto: GetEstimateDto) {
  //   return this.repo.createQueryBuilder()
  //     .select('AVG (price)', 'price')
  //     // first argument: go through all the values ​of the 'make' column in the database and select those values ​​that are equal to the value in the 'manufacturer' variable; second argument: write the value 'estimateDto.make' into the 'manufacturer' variable, i.e. the 'make' value contained in the query string from the request, for example: http://localhost:3000/reports?make=toyota&model=corolla&lng=0&lat=0&mileage=20000&year=1980, here the 'toyota' value will be written to 'make'
  //     .where('make = :manufacturer', { manufacturer: estimateDto.make })
  //     .andWhere('model = :manufacturerModel', {manufacturerModel: estimateDto.model})
  //     // go through all the values ​​of the 'lng' column in the database and subtract the value that is in the 'longitude' variable, the value of the 'longitude' variable comes from the query string of the request, if the difference result is in the range from -5 to 5, then we give this result fits. For example, there are three cars in the database with the production years 1973, 1981 and 1987 and the query string of the request 'year=1980' comes in, in this case: 1973-1980=-7: does not fall into the range -5...5, 1981 -1980=1: falls within the range -5...5: this value suits us, 1987-1980=7, does not fall within the range -5...5
  //     .andWhere('lng - :longitude  BETWEEN -5 AND 5', {longitude : estimateDto.lng})
  //     .andWhere('lat - :latitude BETWEEN -5 AND 5', {latitude: estimateDto.lat})
  //     .andWhere('year - :productionYear BETWEEN -3 AND 3', {productionYear: estimateDto.year})
  //     .andWhere('approved IS TRUE')
  //     .orderBy('ABS(mileage - :carMileage)', 'DESC').
  //     setParameters({carMileage: estimateDto.mileage})
  //     .limit(3)
  //     .getRawOne()
  // }

  // Some code refactoring: destructure from estimateDto and change variable names to name of column:
  createEstimate({ make, model, lng, lat, year, mileage }: GetEstimateDto) {
      return this.repo.createQueryBuilder()
        .select('AVG (price)', 'price')
        // first argument: go through all the values ​of the 'make' column in the database and select those values ​​that are equal to the value in the 'manufacturer' variable; second argument: write the value 'estimateDto.make' into the 'manufacturer' variable, i.e. the 'make' value contained in the query string from the request, for example: http://localhost:3000/reports?make=toyota&model=corolla&lng=0&lat=0&mileage=20000&year=1980, here the 'toyota' value will be written to 'make'
        .where('make = :make', { make })
        .andWhere('model = :model', { model })
        // go through all the values ​​of the 'lng' column in the database and subtract the value that is in the 'longitude' variable, the value of the 'longitude' variable comes from the query string of the request, if the difference result is in the range from -5 to 5, then we give this result fits. For example, there are three cars in the database with the production years 1973, 1981 and 1987 and the query string of the request 'year=1980' comes in, in this case: 1973-1980=-7: does not fall into the range -5...5, 1981 -1980=1: falls within the range -5...5: this value suits us, 1987-1980=7, does not fall within the range -5...5
        .andWhere('lng - :lng  BETWEEN -5 AND 5', { lng })
        .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
        .andWhere('year - :year BETWEEN -3 AND 3', { year })
        .andWhere('approved IS TRUE')
        .orderBy('ABS(mileage - :mileage)', 'DESC').
        setParameters({ mileage })
        .limit(3)
        .getRawOne()
    }

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);
    report.user = user;
    return this.repo.save(report);
  }

  async changeApproval(id: string, approved: boolean) {
    const report = await this.repo.findOne({ where: { id: parseInt(id) } });

    if (!report) {
      throw new NotFoundException('report not found');
    }

    report.approved = approved;
    return this.repo.save(report);
  }
}
