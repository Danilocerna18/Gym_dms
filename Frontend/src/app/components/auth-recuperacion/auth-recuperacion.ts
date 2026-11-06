import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  standalone: true, imports: [FormsModule, RouterLink],
  templateUrl: './auth-recuperacion.html',
  styleUrls: ['../auth-iniciar-sesion/auth-iniciar-sesion.css']
})
export class AuthRecuperacion {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute).snapshot;
  readonly reset = !!this.route.data['reset'];
  private token = this.route.fragment ?? this.route.queryParamMap.get('token') ?? '';
  busy = signal(false);
  done = signal(false);
  invalid = signal(false);
  message = signal('');
  email = '';
  password = '';
  confirm = '';
  visible = false;

  ngOnInit() {
    if (!this.reset) return;
    this.busy.set(true);
    this.auth.validateReset(this.token).pipe(finalize(() => this.busy.set(false))).subscribe({
      error: err => this.failure(err)
    });
  }

  submit() {
    if (this.busy() || this.done() || this.invalid()) return;
    if (this.reset && this.password !== this.confirm) {
      this.message.set('Las contraseñas deben coincidir.');
      return;
    }
    this.busy.set(true);
    this.message.set('');
    const request = this.reset ? this.auth.resetPassword(this.token, this.password) : this.auth.requestRecovery(this.email);
    request.pipe(finalize(() => this.busy.set(false))).subscribe({
      next: result => {
        this.password = this.confirm = this.token = '';
        this.done.set(true);
        this.message.set(result.message);
      },
      error: err => this.failure(err)
    });
  }

  private failure(err: HttpErrorResponse) {
    this.invalid.set(this.reset && err.status === 400);
    this.message.set(err.error?.message ?? 'No se pudo contactar con GymSync. Intenta nuevamente.');
  }
}
