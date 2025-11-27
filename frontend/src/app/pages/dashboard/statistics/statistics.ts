import { Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import {
  StatisticsService,
  PostsByUserData,
  PostsByLikesData,
  PostsStatusData,
} from '../../../services/statistics.service';
import { LoadingService } from '../../../services/loading.service';
import { AlertService } from '../../../services/alert.service';
import { CardComponent } from '../../../shared/ui';
import { firstValueFrom } from 'rxjs';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class Statistics implements OnInit, AfterViewInit {
  private statsService = inject(StatisticsService);
  private loading = inject(LoadingService);
  private alert = inject(AlertService);

  // Charts
  private postsByUserChart: Chart | null = null;
  private postsStatusChart: Chart | null = null;
  private postsByLikesChart: Chart | null = null;

  // Data signals
  postsByUserData = signal<PostsByUserData[]>([]);
  postsStatusData = signal<PostsStatusData | null>(null);
  postsByLikesData = signal<PostsByLikesData[]>([]);

  ngOnInit(): void {
    this.loadStatistics();
  }

  ngAfterViewInit(): void {
    // Los gráficos se crearán después de cargar los datos
  }

  async loadStatistics() {
    try {
      await this.loading.wrap(async () => {
        // Cargar las 3 estadísticas en paralelo
        const [postsByUser, postsStatus, postsByLikes] = await Promise.all([
          firstValueFrom(this.statsService.getPostsByUser()),
          firstValueFrom(this.statsService.getPostsStatus()),
          firstValueFrom(this.statsService.getPostsByLikes()),
        ]);

        this.postsByUserData.set(postsByUser.data);
        this.postsStatusData.set(postsStatus.data);
        this.postsByLikesData.set(postsByLikes.data);

        // Actualizar gráficos
        setTimeout(() => {
          this.createPostsByUserChart();
          this.createPostsStatusChart();
          this.createPostsByLikesChart();
        }, 100);
      });
    } catch (error: any) {
      this.alert.error(error?.error?.message || 'Error al cargar estadísticas');
    }
  }

  private createPostsByUserChart() {
    const canvas = document.getElementById('postsByUserChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Destruir chart anterior si existe
    if (this.postsByUserChart) {
      this.postsByUserChart.destroy();
    }

    const data = this.postsByUserData();
    const labels = data.map((d) => d.nombreUsuario);
    const values = data.map((d) => d.totalPosts);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Publicaciones',
            data: values,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Publicaciones por Usuario',
            font: {
              size: 16,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    };

    this.postsByUserChart = new Chart(canvas, config);
  }

  private createPostsStatusChart() {
    const canvas = document.getElementById('postsStatusChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Destruir chart anterior si existe
    if (this.postsStatusChart) {
      this.postsStatusChart.destroy();
    }

    const data = this.postsStatusData();
    if (!data) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: ['Posts Activos', 'Posts Inactivos'],
        datasets: [
          {
            data: [data.activos, data.inactivos],
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)', // Verde para activos
              'rgba(255, 99, 132, 0.6)', // Rojo para inactivos
            ],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: `Distribución de Posts (Total: ${data.total})`,
            font: {
              size: 16,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || '';
                const value = context.parsed;
                const total = data.total;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    };

    this.postsStatusChart = new Chart(canvas, config);
  }

  private createPostsByLikesChart() {
    const canvas = document.getElementById('postsByLikesChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Destruir chart anterior si existe
    if (this.postsByLikesChart) {
      this.postsByLikesChart.destroy();
    }

    const data = this.postsByLikesData();

    // Si no hay datos, mostrar mensaje
    if (data.length === 0) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('No hay datos disponibles', canvas.width / 2, canvas.height / 2);
      }
      return;
    }

    const labels = data.map((d) => {
      const titulo = d.titulo || 'Sin título';
      return titulo.length > 25 ? titulo.substring(0, 25) + '...' : titulo;
    });
    const values = data.map((d) => d.likesCount);

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Me gusta',
            data: values,
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: 'y', // Barras horizontales
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: 'Posts Más Populares (Top 10 por Likes)',
            font: {
              size: 16,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed.x;
                return `${value} me gusta`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    };

    this.postsByLikesChart = new Chart(canvas, config);
  }
}
